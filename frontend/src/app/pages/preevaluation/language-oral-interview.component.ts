import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  getOralInterviewScript,
  OralInterviewLang,
  OralInterviewLevel,
  OralInterviewPrompt,
  sttLangForLang,
  ttsLocaleForLang,
} from './oral-interview.scripts';
import { estimateOralLevel, OralResultEstimate } from './oral-interview.scoring';
import { AiService } from '../../ai/services/ai.service';
import { OralAssessmentResponseDto } from '../../ai/models/ai.models';
import { ToastService } from '../../services/toast.service';
import jsPDF from 'jspdf';

type Phase =
  | 'setup'
  | 'devices'
  | 'gate'
  | 'calibration'
  | 'interview'
  | 'summary';

type ProctorAlert = {
  at: number;
  reason: string;
  detail: string;
};

/** Reconnaissance vocale navigateur (API non standardisée partout). */
interface SpeechRecInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((ev: Event) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

/** Détection faciale expérimentale (Chrome/Edge). */
interface FaceDetectorCtor {
  new (options?: { fastMode?: boolean; maxDetectedFaces?: number }): {
    detect(image: ImageBitmapSource): Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
  };
}

@Component({
  selector: 'app-language-oral-interview',
  standalone: false,
  templateUrl: './language-oral-interview.component.html',
  styleUrl: './language-oral-interview.component.scss',
})
export class LanguageOralInterviewComponent implements OnDestroy {
  @ViewChild('secureHost') secureHostRef?: ElementRef<HTMLElement>;
  @ViewChild('videoEl') videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('hiddenCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly levels: OralInterviewLevel[] = ['B2', 'C1'];
  readonly langs: { id: OralInterviewLang; label: string }[] = [
    { id: 'fr', label: 'Français' },
    { id: 'en', label: 'English' },
  ];

  phase: Phase = 'setup';
  selectedLang: OralInterviewLang = 'fr';
  selectedLevel: OralInterviewLevel = 'B2';

  loadingDevices = false;
  deviceError = '';
  gateError = '';

  stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private faceTimer: ReturnType<typeof setInterval> | null = null;
  private faceMissCount = 0;
  private readonly faceMissThreshold = 4;
  /** Suivi position visage (normalisé 0–1) pour détecter regard trop mobile / hors cadre */
  private lastFaceCenter: { x: number; y: number } | null = null;
  private faceJitterCount = 0;
  /** Évite les strikes en rafale si plusieurs visages détectés image par image */
  private lastMultiFaceProctorAt = 0;
  private lastProctorAt = 0;
  private speechRec: SpeechRecInstance | null = null;

  /** Réponses enregistrées par question (pour le bilan de niveau) */
  savedAnswers: { promptId: string; text: string }[] = [];
  resultEstimate: OralResultEstimate | null = null;
  /** Niveau CEFR évalué par Gemini (backend ai-service) */
  aiAssessment: OralAssessmentResponseDto | null = null;
  aiLoading = false;
  aiError = false;
  attentionHint = '';

  /** Niveau audio RMS 0–1 (aperçu micro) */
  micLevel = 0;
  private micRaf = 0;

  faceStatus: 'ok' | 'unknown' | 'absent' = 'unknown';
  faceDetectorSupported = false;

  prompts: OralInterviewPrompt[] = [];
  qIndex = 0;
  answerSecondsLeft = 0;
  private answerTimerId: ReturnType<typeof setInterval> | null = null;

  examinerSpeaking = false;
  listening = false;
  transcript = '';
  transcriptManual = '';
  calibrationPhrase = '';

  readonly maxStrikes = 2;
  strikes = 0;
  proctorLog: ProctorAlert[] = [];
  /** Texte affiché dans la fenêtre d’alerte sécurité (rouge) */
  securityAlertBanner = '';
  /** Modale plein écran visible après chaque alerte */
  securityAlertModalOpen = false;
  /** Si défini, fermer la modale déclenche l’arrêt de session avec ce message */
  pendingTerminateMsg: string | null = null;

  /** Indique que la prochaine fermeture de la modale terminera la session (max strikes). */
  get isPendingSessionTermination(): boolean {
    return this.pendingTerminateMsg != null;
  }

  summaryNote = '';
  /** Sur téléphone, le plein écran échoue souvent — on peut poursuivre sans */
  mobileFriendlyNote = '';

  private fraudMonitor = false;
  private fullscreenGraceUntil = 0;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private aiService: AiService,
    private toast: ToastService
  ) {
    this.faceDetectorSupported =
      typeof window !== 'undefined' &&
      'FaceDetector' in window &&
      typeof (window as unknown as { FaceDetector?: FaceDetectorCtor }).FaceDetector ===
        'function';
  }

  ngOnDestroy(): void {
    this.cleanupStream();
    this.stopFaceLoop();
    this.stopMicMeter();
    this.stopAnswerTimer();
    this.cancelSpeech();
    this.stopListening();
    try {
      void document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }

  get currentPrompt(): OralInterviewPrompt | null {
    return this.prompts[this.qIndex] ?? null;
  }

  get progressLabel(): string {
    if (!this.prompts.length) return '';
    return `${this.qIndex + 1} / ${this.prompts.length}`;
  }

  startDevicePhase(): void {
    this.deviceError = '';
    this.phase = 'devices';
    this.loadingDevices = true;
    this.mobileFriendlyNote = this.isMobileDevice()
      ? 'Sur téléphone : autorisez caméra + micro, de préférence Chrome ou Safari récent ; tenez l’appareil en mode paysage et face à vous.'
      : '';
    this.tryGetUserMedia(0);
  }

  private isMobileDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /** Contraintes progressives (meilleure compatibilité mobile). */
  private tryGetUserMedia(attempt: number): void {
    const audioOpts = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };
    const constraintsList: MediaStreamConstraints[] = [
      {
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: audioOpts,
      },
      {
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: audioOpts,
      },
      { video: { facingMode: 'user' }, audio: audioOpts },
      { video: true, audio: true },
    ];
    const c = constraintsList[Math.min(attempt, constraintsList.length - 1)]!;
    navigator.mediaDevices
      .getUserMedia(c)
      .then((s) => {
        this.ngZone.run(() => {
          this.stream = s;
          this.loadingDevices = false;
          queueMicrotask(() => {
            this.attachVideo();
            void this.videoRef?.nativeElement?.play?.().catch(() => {});
          });
          this.startMicMeter(s);
        });
      })
      .catch(() => {
        if (attempt + 1 < constraintsList.length) {
          this.tryGetUserMedia(attempt + 1);
          return;
        }
        this.ngZone.run(() => {
          this.loadingDevices = false;
          this.deviceError =
            'Caméra et micro sont requis. Sur téléphone : réglages du navigateur → autoriser caméra/micro, ou essayez Chrome.';
        });
      });
  }

  private attachVideo(): void {
    const v = this.videoRef?.nativeElement;
    if (!v || !this.stream) return;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.srcObject = this.stream;
    void v.play().catch(() => {});
  }

  private startMicMeter(stream: MediaStream): void {
    this.stopMicMeter();
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    this.audioCtx = new AudioContextCtor();
    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume().catch(() => {});
    }
    const src = this.audioCtx.createMediaStreamSource(stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    src.connect(this.analyser);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    const tick = () => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const z = (data[i] - 128) / 128;
        sum += z * z;
      }
      const rms = Math.sqrt(sum / data.length);
      this.ngZone.run(() => {
        this.micLevel = Math.min(1, rms * 3);
      });
      this.micRaf = requestAnimationFrame(tick);
    };
    this.micRaf = requestAnimationFrame(tick);
  }

  private stopMicMeter(): void {
    if (this.micRaf) cancelAnimationFrame(this.micRaf);
    this.micRaf = 0;
    if (this.audioCtx) {
      void this.audioCtx.close().catch(() => {});
    }
    this.audioCtx = null;
    this.analyser = null;
  }

  confirmDevicesAndGate(): void {
    if (!this.stream) {
      this.deviceError = 'Flux média introuvable.';
      return;
    }
    this.phase = 'gate';
  }

  onGateContinue(): void {
    this.gateError = '';
    const el = this.secureHostRef?.nativeElement;
    if (!el) {
      this.gateError = 'Impossible de lancer le mode examen.';
      return;
    }
    const anyEl = el as HTMLElement & { webkitRequestFullscreen?: () => void };
    const req = el.requestFullscreen?.bind(el) ?? anyEl.webkitRequestFullscreen?.bind(anyEl);
    if (req) {
      void Promise.resolve(req())
        .then(() => this.ngZone.run(() => this.afterFullscreen()))
        .catch(() => {
          this.ngZone.run(() => {
            this.gateError =
              'Plein écran refusé (souvent sur iPhone). Utilisez le bouton « Continuer sans plein écran » ci-dessous.';
          });
        });
    } else {
      this.gateError = 'Plein écran non disponible — utilisez « Continuer sans plein écran ».';
    }
  }

  /** Mobile / Safari : plein écran souvent indisponible — on lance quand même l’entretien (contrôles anti-triche un peu réduits). */
  continueWithoutFullscreen(): void {
    this.gateError = '';
    this.ngZone.run(() => this.afterFullscreen());
  }

  private afterFullscreen(): void {
    this.savedAnswers = [];
    this.resultEstimate = null;
    this.securityAlertBanner = '';
    this.securityAlertModalOpen = false;
    this.pendingTerminateMsg = null;
    this.lastFaceCenter = null;
    this.faceJitterCount = 0;
    this.prompts = getOralInterviewScript(this.selectedLang, this.selectedLevel);
    this.calibrationPhrase =
      this.selectedLang === 'fr'
        ? 'Je confirme que je passe cet entretien seul, sans assistance externe, et j’accepte la surveillance par caméra et microphone.'
        : 'I confirm that I am taking this interview alone, without external help, and I accept camera and microphone monitoring.';
    this.phase = 'calibration';
    this.fullscreenGraceUntil = Date.now() + 2500;
    queueMicrotask(() => {
      this.attachVideo();
      this.startFaceLoop();
      this.fraudMonitor = true;
    });
  }

  finishCalibration(): void {
    this.phase = 'interview';
    this.qIndex = 0;
    void this.playCurrentQuestion();
  }

  private startFaceLoop(): void {
    this.stopFaceLoop();
    this.faceMissCount = 0;
    this.faceTimer = setInterval(() => void this.detectFaceOnce(), 1100);
  }

  private stopFaceLoop(): void {
    if (this.faceTimer) {
      clearInterval(this.faceTimer);
      this.faceTimer = null;
    }
  }

  private async detectFaceOnce(): Promise<void> {
    if (this.phase !== 'calibration' && this.phase !== 'interview') return;
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas || !this.stream) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w < 32 || h < 32) return;

    const FD = (window as unknown as { FaceDetector?: FaceDetectorCtor }).FaceDetector;
    if (FD) {
      try {
        const detector = new FD({ fastMode: true, maxDetectedFaces: 5 });
        const faces = await detector.detect(video);
        this.ngZone.run(() => {
          if (faces.length > 1) {
            this.faceStatus = 'ok';
            this.attentionHint = 'Plusieurs visages';
            this.lastFaceCenter = null;
            const now = Date.now();
            if (now - this.lastMultiFaceProctorAt > 5000) {
              this.lastMultiFaceProctorAt = now;
              this.recordProctor('MULTI', 'Plusieurs personnes détectées — assistance interdite en examen.');
            }
            return;
          }
          if (faces.length === 1) {
            this.faceStatus = 'ok';
            this.faceMissCount = 0;
            this.attentionHint = '';
            const box = faces[0]!.boundingBox;
            const cx = (box.left + box.width / 2) / w;
            const cy = (box.top + box.height / 2) / h;
            if (this.lastFaceCenter) {
              const dist = Math.hypot(cx - this.lastFaceCenter.x, cy - this.lastFaceCenter.y);
              if (dist > 0.2) {
                this.faceJitterCount++;
                if (this.faceJitterCount >= 6) {
                  this.faceJitterCount = 0;
                  this.recordProctor(
                    'ATTENTION',
                    'Mouvements de tête / regard très instables (indicateur anti-triche).'
                  );
                }
              } else {
                this.faceJitterCount = Math.max(0, this.faceJitterCount - 1);
              }
            }
            this.lastFaceCenter = { x: cx, y: cy };
            return;
          }
          this.faceStatus = 'absent';
          this.lastFaceCenter = null;
          this.faceMissCount++;
          if (this.faceMissCount >= this.faceMissThreshold) {
            this.faceMissCount = 0;
            this.recordProctor('FACE', 'Aucun visage détecté de façon prolongée.');
          }
        });
        return;
      } catch {
        /* fallback */
      }
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 160;
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += data[i]! + data[i + 1]! + data[i + 2]!;
    }
    const avg = sum / (data.length / 4) / 3;
    this.ngZone.run(() => {
      if (avg > 18 && avg < 245) {
        this.faceStatus = 'ok';
        this.faceMissCount = 0;
      } else {
        this.faceStatus = 'unknown';
        this.faceMissCount++;
        if (this.faceMissCount >= this.faceMissThreshold + 2) {
          this.faceMissCount = 0;
          this.recordProctor('VISUEL', 'Image instable ou visage peu visible.');
        }
      }
    });
  }

  private recordProctor(reason: string, detail: string): void {
    if (!this.fraudMonitor) return;
    if (Date.now() < this.fullscreenGraceUntil) return;
    const now = Date.now();
    if (reason !== 'FACE' && reason !== 'VISUEL' && now - this.lastProctorAt < 2400) {
      return;
    }
    this.ngZone.run(() => {
      if (this.strikes >= this.maxStrikes) return;

      this.lastProctorAt = now;
      this.strikes++;
      this.proctorLog.push({ at: now, reason, detail });
      this.toast.warning(`Alerte sécurité [${reason}] : ${detail}`);

      if (this.strikes >= this.maxStrikes) {
        this.securityAlertBanner =
          this.selectedLang === 'fr'
            ? `Alertes sécurité : ${this.strikes} / ${this.maxStrikes} - Trop d’alertes détectées.`
            : `Security alerts: ${this.strikes} / ${this.maxStrikes} - Too many alerts detected.`;

        const msg = this.selectedLang === 'fr'
            ? 'La session est terminée pour non-respect des règles de sécurité.'
            : 'The session has been terminated due to security violations.';
            
        this.finishInterviewTerminated(msg); // Arrêt immédiat en arrière-plan (camera, timers, etc)
        this.pendingTerminateMsg = msg; // Laisser le message pour l'affichage de la modale
        this.securityAlertModalOpen = true; // Afficher la modale sur la page de résumé
      } else {
        this.securityAlertBanner =
          this.selectedLang === 'fr'
            ? `Alertes sécurité : ${this.strikes} / ${this.maxStrikes} - ${detail}`
            : `Security alerts : ${this.strikes} / ${this.maxStrikes} - ${detail}`;
        
        this.securityAlertModalOpen = true;
        this.pendingTerminateMsg = null;
      }
    });
  }

  dismissSecurityAlertModal(): void {
    this.securityAlertModalOpen = false;
    const pending = this.pendingTerminateMsg;
    this.pendingTerminateMsg = null;
    if (pending) {
      this.finishInterviewTerminated(pending);
    }
  }

  private finishInterviewTerminated(msg: string): void {
    this.fraudMonitor = false;
    this.stopFaceLoop();
    this.stopAnswerTimer();
    this.cancelSpeech();
    this.stopListening();
    this.cleanupStream();
    this.resultEstimate = null;
    this.summaryNote = msg;
    this.phase = 'summary';
    try {
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {});
      } else {
        const doc = document as any;
        if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
        if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
        if (doc.msExitFullscreen) doc.msExitFullscreen();
      }
    } catch (e) {
      /* fallback ignore */
    }
  }

  async playCurrentQuestion(): Promise<void> {
    const p = this.currentPrompt;
    if (!p) {
      this.finishInterviewOk();
      return;
    }
    this.transcript = '';
    this.transcriptManual = '';
    this.examinerSpeaking = true;
    this.cancelSpeech();
    const u = new SpeechSynthesisUtterance(p.examinerText);
    u.lang = ttsLocaleForLang(this.selectedLang);
    u.rate = this.selectedLang === 'fr' ? 0.95 : 1;
    u.onend = () =>
      this.ngZone.run(() => {
        this.examinerSpeaking = false;
        this.beginAnswerPhase(p);
      });
    u.onerror = () =>
      this.ngZone.run(() => {
        this.examinerSpeaking = false;
        this.beginAnswerPhase(p);
      });
    window.speechSynthesis.speak(u);
  }

  private beginAnswerPhase(p: OralInterviewPrompt): void {
    this.answerSecondsLeft = p.suggestedAnswerSeconds;
    this.stopAnswerTimer();
    this.answerTimerId = setInterval(() => {
      this.ngZone.run(() => {
        this.answerSecondsLeft--;
        if (this.answerSecondsLeft <= 0) {
          this.stopAnswerTimer();
        }
      });
    }, 1000);
    void this.startListening();
  }

  private stopAnswerTimer(): void {
    if (this.answerTimerId) {
      clearInterval(this.answerTimerId);
      this.answerTimerId = null;
    }
  }

  private startListening(): Promise<void> {
    this.stopListening();
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecInstance;
      webkitSpeechRecognition?: new () => SpeechRecInstance;
    };
    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Rec) {
      this.listening = false;
      return Promise.resolve();
    }
    this.listening = true;
    const rec = new Rec();
    this.speechRec = rec;
    rec.lang = sttLangForLang(this.selectedLang);
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = true;
    rec.onresult = (ev: Event) => {
      const r = ev as unknown as {
        resultIndex: number;
        results: Array<Array<{ transcript: string }>>;
      };
      let text = '';
      for (let i = r.resultIndex; i < r.results.length; i++) {
        text += r.results[i]![0]!.transcript;
      }
      this.ngZone.run(() => {
        this.transcript = (this.transcript + ' ' + text).trim();
      });
    };
    rec.onerror = () => {
      this.ngZone.run(() => {
        this.listening = false;
      });
    };
    rec.onend = () => {
      this.ngZone.run(() => {
        this.listening = false;
      });
    };
    try {
      rec.start();
    } catch {
      this.listening = false;
      this.speechRec = null;
    }
    return Promise.resolve();
  }

  private stopListening(): void {
    if (this.speechRec) {
      try {
        this.speechRec.stop();
      } catch {
        try {
          this.speechRec.abort?.();
        } catch {
          /* ignore */
        }
      }
      this.speechRec = null;
    }
    this.listening = false;
  }

  private cancelSpeech(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.examinerSpeaking = false;
  }

  nextQuestion(): void {
    this.stopListening();
    this.stopAnswerTimer();
    this.cancelSpeech();
    const extra = this.transcriptManual.trim();
    let combined = this.transcript.trim();
    if (extra) {
      combined = (combined + ' ' + extra).trim();
    }
    const p = this.currentPrompt;
    if (p) {
      this.savedAnswers.push({ promptId: p.id, text: combined });
    }
    this.qIndex++;
    if (this.qIndex >= this.prompts.length) {
      this.finishInterviewOk();
      return;
    }
    this.transcript = '';
    this.transcriptManual = '';
    void this.playCurrentQuestion();
  }

  private finishInterviewOk(): void {
    this.fraudMonitor = false;
    this.stopFaceLoop();
    this.stopAnswerTimer();
    this.cancelSpeech();
    this.stopListening();
    this.cleanupStream();
    const texts = this.savedAnswers.map((a) => a.text);
    this.resultEstimate = estimateOralLevel(
      this.selectedLang,
      this.selectedLevel,
      texts,
      this.strikes
    );
    this.aiAssessment = null;
    this.aiError = false;
    const items = this.savedAnswers.map((a) => {
      const pr = this.prompts.find((p) => p.id === a.promptId);
      return {
        question: pr?.examinerText ?? '',
        answer: a.text,
      };
    });
    if (items.length > 0) {
      this.aiLoading = true;
      this.aiService
        .evaluateOralAssessment({
          language: this.selectedLang,
          targetLevel: this.selectedLevel,
          items,
          securityStrikes: this.strikes,
          sessionTerminatedEarly: false,
        })
        .subscribe({
          next: (r) => {
            this.ngZone.run(() => {
              this.aiAssessment = r;
              this.aiLoading = false;
            });
          },
          error: () => {
            this.ngZone.run(() => {
              this.aiError = true;
              this.aiLoading = false;
            });
          },
        });
    } else {
      this.aiLoading = false;
    }
    this.summaryNote =
      this.selectedLang === 'fr'
        ? 'Entretien terminé. Une analyse de niveau par IA est en cours ; une estimation locale s’affiche aussi en secours.'
        : 'Interview finished. An AI level analysis is loading; a local estimate is shown as a fallback.';
    this.phase = 'summary';
    try {
      void document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }

  exportToPdf(): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const fr = this.selectedLang === 'fr';
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxW = pageW - margin * 2;
    let y = 20;

    const line = (text: string, size = 11, bold = false, color: [number,number,number] = [30,30,30]) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, maxW) as string[];
      lines.forEach((l: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(l, margin, y);
        y += size * 0.45;
      });
      y += 2;
    };

    const divider = () => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageW - margin, y);
      y += 5;
    };

    // En-tête
    line(fr ? 'Rapport d\'évaluation orale' : 'Oral Assessment Report', 18, true, [25, 118, 210]);
    line(`${fr ? 'Langue' : 'Language'} : ${this.selectedLang === 'fr' ? 'Français' : 'English'}  |  ${fr ? 'Niveau ciblé' : 'Target level'} : ${this.selectedLevel}`, 10, false, [100,100,100]);
    line(`${fr ? 'Date' : 'Date'} : ${new Date().toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { day:'2-digit', month:'long', year:'numeric' })}`, 10, false, [100,100,100]);
    y += 3;
    divider();

    // Analyse IA
    if (this.aiAssessment) {
      line(fr ? 'Analyse IA (Gemini)' : 'AI Analysis (Gemini)', 13, true, [25, 118, 210]);
      line(`${fr ? 'Niveau CEFR' : 'CEFR Level'} : ${this.aiAssessment.cefrLevel}`, 12, true);
      line(`${fr ? 'Confiance' : 'Confidence'} : ${Math.round(this.aiAssessment.confidence * 100)} %`, 10);
      line(fr ? this.aiAssessment.summaryFr : this.aiAssessment.summaryEn, 10);
      if (this.aiAssessment.strengthsFr?.length) {
        line(fr ? 'Points forts :' : 'Strengths:', 10, true);
        this.aiAssessment.strengthsFr.forEach(s => line(`  • ${s}`, 10));
      }
      if (this.aiAssessment.weaknessesFr?.length) {
        line(fr ? 'Axes d\'amélioration :' : 'Areas to improve:', 10, true);
        this.aiAssessment.weaknessesFr.forEach(w => line(`  • ${w}`, 10));
      }
      y += 2; divider();
    } else if (this.aiError) {
      line(fr ? 'Analyse IA : non disponible (erreur réseau)' : 'AI Analysis: unavailable (network error)', 10, false, [150,100,0]);
      y += 2; divider();
    }

    // Estimation locale
    if (this.resultEstimate) {
      const r = this.resultEstimate;
      line(fr ? 'Estimation locale (règles automatiques)' : 'Local Estimate (automatic rules)', 13, true, [46, 125, 50]);
      line(`${fr ? 'Niveau CEFR indicatif' : 'Indicative CEFR Level'} : ${r.estimatedLevel}`, 12, true);
      line(fr ? r.summaryFr : r.summaryEn, 10);
      if (r.breakdown.levelCapReasonFr) {
        line(fr ? r.breakdown.levelCapReasonFr : r.breakdown.levelCapReasonEn, 10, false, [120,80,0]);
      }
      y += 2;
      line(fr ? 'Détail des statistiques :' : 'Statistics breakdown:', 10, true);
      line(`  • ${fr ? 'Score automatique' : 'Automatic score'} : ${r.scorePercent} %`, 10);
      line(`  • ${fr ? 'Réponses « je ne sais pas » / vides' : 'Refusal-like / empty answers'} : ${r.breakdown.refusalLikeAnswers}`, 10);
      line(`  • ${fr ? 'Réponses trop courtes (< 22 mots)' : 'Too short answers (< 22 words)'} : ${r.breakdown.tooShortAnswers}`, 10);
      line(`  • ${fr ? 'Mots au total' : 'Total words'} : ${r.breakdown.totalWords}`, 10);
      line(`  • ${fr ? 'Diversité lexicale' : 'Lexical diversity'} : ${r.breakdown.uniqueWordRatio.toFixed(2)}`, 10);
      line(`  • ${fr ? 'Moyenne mots / réponse' : 'Avg words per answer'} : ${r.breakdown.avgWordsPerAnswer}`, 10);
      line(`  • ${fr ? 'Mots longs (≥ 8 lettres)' : 'Long words (≥ 8 letters)'} : ${r.breakdown.longWordCount}`, 10);
      if (r.breakdown.contentPenalty > 0)
        line(`  • ${fr ? 'Pénalité contenu' : 'Content penalty'} : −${r.breakdown.contentPenalty} pts`, 10);
      if (r.breakdown.strikePenalty > 0)
        line(`  • ${fr ? 'Pénalité alertes sécurité' : 'Security alert penalty'} : −${r.breakdown.strikePenalty} pts`, 10);
      y += 2;
      line(fr ? r.disclaimerFr : r.disclaimerEn, 9, false, [120,120,120]);
    }

    // Journal alertes
    if (this.proctorLog.length) {
      y += 2; divider();
      line(fr ? `Journal des alertes (${this.proctorLog.length})` : `Security alerts log (${this.proctorLog.length})`, 11, true, [180,30,30]);
      this.proctorLog.forEach(e => line(`  • ${e.reason} — ${e.detail}`, 9, false, [150,50,50]));
    }

    // Pied de page
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160,160,160);
      doc.text(`Learnify — ${fr ? 'Évaluation orale' : 'Oral Assessment'} — ${i}/${totalPages}`, margin, 290);
    }

    const lang = this.selectedLang === 'fr' ? 'fr' : 'en';
    doc.save(`evaluation-orale-${lang}-${this.selectedLevel}-${new Date().toISOString().slice(0,10)}.pdf`);
  }

  leaveToPreevaluation(): void {
    this.cleanupStream();
    void this.router.navigate(['/preevaluation/start']);
  }

  goHome(): void {
    this.cleanupStream();
    void this.router.navigate(['/']);
  }

  private cleanupStream(): void {
    this.stopMicMeter();
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    const v = this.videoRef?.nativeElement;
    if (v) v.srcObject = null;
  }

  @HostListener('document:visibilitychange')
  onVisibility(): void {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      this.recordProctor(
        'VISIBILITÉ',
        'Application ou onglet masqué (chat, autre app, retour accueil) — suspicion de triche.'
      );
    }
  }

  @HostListener('window:blur')
  onBlur(): void {
    this.recordProctor('FOCUS', 'Fenêtre a perdu le focus (ex. ouverture du clavier chat ailleurs).');
  }

  @HostListener('document:fullscreenchange')
  onFs(): void {
    if (!this.fraudMonitor) return;
    if (Date.now() < this.fullscreenGraceUntil) return;
    if (document.fullscreenElement == null && (this.phase === 'calibration' || this.phase === 'interview')) {
      this.recordProctor('PLEIN ÉCRAN', 'Sortie du mode plein écran pendant l’examen.');
    }
  }
}
