import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Interface pour les commandes vocales
interface VoiceCommand {
  keywords: string[];
  route: string;
  description: string;
}

@Component({
  selector: 'app-voice-command',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-command.component.html',
  styleUrls: ['./voice-command.component.scss']
})
export class VoiceCommandComponent implements OnInit, OnDestroy {
  // État du composant
  isListening = false;
  statusMessage = '';
  isSupported = false;
  
  // Reconnaissance vocale
  private recognition: any;
  
  // Dictionnaire des commandes vocales avec synonymes
  private commands: VoiceCommand[] = [
    // Pages publiques
    {
      keywords: ['accueil', 'home', 'page d\'accueil', 'maison'],
      route: '/',
      description: 'Page d\'accueil'
    },
    {
      keywords: ['cours', 'courses', 'formations', 'liste des cours'],
      route: '/courses',
      description: 'Liste des cours'
    },
    {
      keywords: ['événements', 'events', 'évènements', 'liste des événements'],
      route: '/events',
      description: 'Liste des événements'
    },
    {
      keywords: ['clubs', 'club', 'liste des clubs'],
      route: '/clubs',
      description: 'Liste des clubs'
    },
    
    // Quiz publics
    {
      keywords: ['quiz', 'quizzes', 'questionnaire', 'questionnaires', 'quiz publics'],
      route: '/quizzes',
      description: 'Liste des quiz publics'
    },
    
    // Feedbacks publics
    {
      keywords: ['feedback', 'feedbacks', 'retour', 'retours', 'avis', 'feedbacks publics'],
      route: '/feedbacks',
      description: 'Liste des feedbacks'
    },
    {
      keywords: ['nouveau feedback', 'créer feedback', 'ajouter feedback', 'donner feedback'],
      route: '/feedbacks/new',
      description: 'Créer un feedback'
    },
    
    // Dashboard Admin
    {
      keywords: ['dashboard', 'tableau de bord', 'admin', 'administration'],
      route: '/dashboard',
      description: 'Dashboard administrateur'
    },
    
    // Quiz Admin
    {
      keywords: ['quiz admin', 'gestion quiz', 'admin quiz', 'quiz dashboard'],
      route: '/dashboard/quizzes',
      description: 'Gestion des quiz (Admin)'
    },
    {
      keywords: ['nouveau quiz', 'créer quiz', 'ajouter quiz'],
      route: '/dashboard/quizzes/new',
      description: 'Créer un quiz'
    },
    
    // Feedbacks Admin
    {
      keywords: ['feedback admin', 'gestion feedback', 'admin feedback', 'feedback dashboard'],
      route: '/dashboard/feedbacks',
      description: 'Gestion des feedbacks (Admin)'
    },
    {
      keywords: ['nouveau feedback admin', 'créer feedback admin'],
      route: '/dashboard/feedbacks/new',
      description: 'Créer un feedback (Admin)'
    },
    
    // Cours Admin
    {
      keywords: ['cours admin', 'gestion cours', 'admin cours', 'cours dashboard'],
      route: '/dashboard/courses',
      description: 'Gestion des cours (Admin)'
    },
    {
      keywords: ['nouveau cours', 'créer cours', 'ajouter cours'],
      route: '/dashboard/courses/new',
      description: 'Créer un cours'
    },
    
    // Événements Admin
    {
      keywords: ['événements admin', 'gestion événements', 'admin événements', 'événements dashboard'],
      route: '/dashboard/events',
      description: 'Gestion des événements (Admin)'
    },
    {
      keywords: ['nouvel événement', 'créer événement', 'ajouter événement'],
      route: '/dashboard/events/new',
      description: 'Créer un événement'
    },
    
    // Clubs Admin
    {
      keywords: ['clubs admin', 'gestion clubs', 'admin clubs', 'clubs dashboard'],
      route: '/dashboard/clubs',
      description: 'Gestion des clubs (Admin)'
    },
    {
      keywords: ['nouveau club', 'créer club', 'ajouter club'],
      route: '/dashboard/clubs/new',
      description: 'Créer un club'
    },
    
    // IA Services
    {
      keywords: ['générateur', 'generator', 'ia quiz', 'générer quiz', 'quiz ia'],
      route: '/dashboard/ai/generator',
      description: 'Générateur de quiz IA'
    },
    {
      keywords: ['feedback ia', 'ia feedback', 'feedback personnalisé', 'analyse feedback'],
      route: '/dashboard/ai/feedback',
      description: 'Feedback IA personnalisé'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkBrowserSupport();
    this.setupKeyboardShortcut();
  }

  ngOnDestroy(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.removeKeyboardShortcut();
  }

  /**
   * Configure le raccourci clavier "M" pour activer la commande vocale
   */
  private keyboardHandler = (event: KeyboardEvent) => {
    // Vérifier si la touche "M" est pressée (sans Ctrl, Alt, Shift)
    if (event.key?.toLowerCase() === 'm' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
      // Ne pas activer si l'utilisateur est en train de taper dans un champ
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;
      
      if (!isInputField) {
        event.preventDefault();
        this.toggleListening();
        console.log('⌨️ Raccourci clavier "M" activé');
      }
    }
  };

  setupKeyboardShortcut(): void {
    document.addEventListener('keydown', this.keyboardHandler);
    console.log('⌨️ Raccourci clavier configuré: Appuyez sur "M" pour activer la commande vocale');
  }

  removeKeyboardShortcut(): void {
    document.removeEventListener('keydown', this.keyboardHandler);
  }

  /**
   * Vérifie si le navigateur supporte la reconnaissance vocale
   */
  checkBrowserSupport(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.isSupported = true;
      this.initRecognition();
      console.log('✅ Web Speech API supportée');
    } else {
      this.isSupported = false;
      console.error('❌ Web Speech API non supportée par ce navigateur');
      this.statusMessage = 'Votre navigateur ne supporte pas la reconnaissance vocale';
    }
  }

  /**
   * Initialise la reconnaissance vocale
   */
  initRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configuration
    this.recognition.lang = 'fr-FR'; // Langue française
    this.recognition.continuous = false; // Arrêt automatique après une phrase
    this.recognition.interimResults = false; // Pas de résultats intermédiaires
    this.recognition.maxAlternatives = 1; // Une seule alternative

    // Événement: Début de l'écoute
    this.recognition.onstart = () => {
      this.isListening = true;
      this.statusMessage = '🎙️ Écoute en cours... Parlez maintenant';
      console.log('🎤 Reconnaissance vocale démarrée');
    };

    // Événement: Résultat obtenu
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('📝 Transcription:', transcript);
      this.processCommand(transcript);
    };

    // Événement: Erreur
    this.recognition.onerror = (event: any) => {
      console.error('❌ Erreur de reconnaissance:', event.error);
      this.isListening = false;
      
      switch (event.error) {
        case 'no-speech':
          this.statusMessage = '⚠️ Aucune parole détectée';
          break;
        case 'audio-capture':
          this.statusMessage = '⚠️ Microphone non disponible';
          break;
        case 'not-allowed':
          this.statusMessage = '⚠️ Permission microphone refusée';
          break;
        default:
          this.statusMessage = `⚠️ Erreur: ${event.error}`;
      }
      
      setTimeout(() => this.statusMessage = '', 3000);
    };

    // Événement: Fin de l'écoute
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('🛑 Reconnaissance vocale terminée');
      
      if (!this.statusMessage.includes('✅') && !this.statusMessage.includes('⚠️')) {
        this.statusMessage = '';
      }
    };
  }

  /**
   * Démarre ou arrête l'écoute
   */
  toggleListening(): void {
    if (!this.isSupported) {
      alert('Votre navigateur ne supporte pas la reconnaissance vocale.\nUtilisez Chrome ou Edge.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  }

  /**
   * Traite la commande vocale et navigue vers la page correspondante
   */
  processCommand(transcript: string): void {
    console.log('🔍 Recherche de commande pour:', transcript);
    
    // Recherche de la commande correspondante
    const matchedCommand = this.commands.find(cmd => 
      cmd.keywords.some(keyword => transcript.includes(keyword))
    );

    if (matchedCommand) {
      console.log('✅ Commande trouvée:', matchedCommand.description);
      this.statusMessage = `✅ Navigation vers ${matchedCommand.description}`;
      
      // Navigation après un court délai
      setTimeout(() => {
        this.router.navigate([matchedCommand.route]);
        this.statusMessage = '';
      }, 1000);
    } else {
      console.log('❌ Commande non reconnue');
      this.statusMessage = '❌ Commande non reconnue. Essayez: "quiz", "feedback", "dashboard"...';
      setTimeout(() => this.statusMessage = '', 3000);
    }
  }

  /**
   * Affiche la liste des commandes disponibles
   */
  showCommands(): void {
    console.log('📋 Commandes vocales disponibles:');
    this.commands.forEach(cmd => {
      console.log(`- ${cmd.description}: ${cmd.keywords.join(', ')}`);
    });
    
    alert(
      '🎤 COMMANDE VOCALE\n\n' +
      '⌨️ Raccourci: Appuyez sur "M" pour activer\n' +
      '🖱️ Ou cliquez sur le bouton microphone\n\n' +
      '📋 Commandes disponibles:\n\n' +
      this.commands.map(cmd => `• ${cmd.description}\n  (${cmd.keywords.slice(0, 3).join(', ')})`).join('\n\n')
    );
  }
}
