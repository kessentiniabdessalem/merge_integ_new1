import { OralInterviewLang, OralInterviewLevel } from './oral-interview.scripts';

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C2'] as const;
type LevelId = (typeof LEVEL_ORDER)[number];

function levelIndex(l: string): number {
  const i = LEVEL_ORDER.indexOf(l as LevelId);
  return i >= 0 ? i : 2;
}

/** Garde le niveau le plus bas des deux (plafond de compétence). */
function applyCeiling(level: string, ceiling: string): string {
  const a = levelIndex(level);
  const b = levelIndex(ceiling);
  return LEVEL_ORDER[Math.min(a, b)] ?? 'B1';
}

export type OralResultBreakdown = {
  totalWords: number;
  uniqueWordRatio: number;
  avgWordsPerAnswer: number;
  longWordCount: number;
  strikePenalty: number;
  refusalLikeAnswers: number;
  tooShortAnswers: number;
  contentPenalty: number;
  levelCapReasonFr: string;
  levelCapReasonEn: string;
};

export type OralResultEstimate = {
  estimatedLevel: string;
  summaryFr: string;
  summaryEn: string;
  scorePercent: number;
  breakdown: OralResultBreakdown;
  disclaimerFr: string;
  disclaimerEn: string;
};

function tokenize(text: string): string[] {
  const t = text
    .toLowerCase()
    .replace(/[«»"'`´]/g, ' ')
    .replace(/[^a-zA-ZàâäéèêëïîôùûüÿçœæñÀ-ÿ0-9\s'-]/g, ' ')
    .trim();
  if (!t) return [];
  return t.split(/\s+/).filter((w) => w.length > 1);
}

function wordCount(text: string): number {
  return tokenize(text).length;
}

/** Refus explicite ou fuite (« je ne sais pas », trop court pour être un vrai développement) */
export function isRefusalOrEmpty(text: string, lang: OralInterviewLang): boolean {
  const s = text.toLowerCase().trim();
  if (s.length < 4) return true;
  const wc = wordCount(s);
  if (wc < 5) return true;

  if (lang === 'fr') {
    if (
      /\b(je ne sais pas|j'sais pas|j'en sais rien|aucune idée|pas d'idée|je sais pas|jsp)\b/.test(s)
    ) {
      return wc < 45;
    }
    if (/\b(r?ien à dire|je passe|pass)\b/.test(s) && wc < 25) return true;
  } else {
    if (/\b(i don't know|i do not know|dunno|no idea)\b/.test(s)) {
      return wc < 45;
    }
    if (/\b(nothing to say|skip)\b/.test(s) && wc < 25) return true;
  }
  return false;
}

const MIN_WORDS_DEVELOPED = 22;

/**
 * Score sévère : « je ne sais pas » sur 2 questions → plafond A2.
 * Un niveau certifié « réel » exige humain ou IA serveur.
 */
export function estimateOralLevel(
  lang: OralInterviewLang,
  targetLevel: OralInterviewLevel,
  answers: string[],
  strikes: number
): OralResultEstimate {
  const list = answers.length ? answers : [''];
  let refusalLikeAnswers = 0;
  let tooShortAnswers = 0;

  for (const a of list) {
    const w = wordCount(a);
    if (w < MIN_WORDS_DEVELOPED) tooShortAnswers++;
    if (isRefusalOrEmpty(a, lang)) refusalLikeAnswers++;
  }

  const joined = list.join(' ').trim();
  const words = tokenize(joined);
  const totalWords = words.length;
  const unique = new Set(words);
  const uniqueWordRatio = totalWords > 0 ? unique.size / totalWords : 0;
  const nAns = Math.max(1, list.filter((a) => a.trim().length > 0).length);
  const avgWordsPerAnswer = totalWords / nAns;
  const longWordCount = words.filter((w) => w.replace(/[^a-zà-ÿ]/gi, '').length >= 8).length;

  const strikePenalty = Math.min(50, strikes * 14);

  let contentPenalty = refusalLikeAnswers * 25 + Math.max(0, tooShortAnswers - refusalLikeAnswers) * 10;
  contentPenalty = Math.min(90, contentPenalty);

  let raw =
    Math.min(80, avgWordsPerAnswer * 2.4) * 0.32 +
    Math.min(80, uniqueWordRatio * 120) * 0.33 +
    Math.min(80, (longWordCount / Math.max(1, totalWords)) * 280) * 0.2 +
    Math.min(80, totalWords / Math.max(6, nAns * 28)) * 80 * 0.15;

  raw = Math.max(0, raw - strikePenalty - contentPenalty);

  let ceiling: string = 'C2';
  let levelCapReasonFr =
    'Analyse automatique du texte (transcription + saisie). Pas une certification officielle.';
  let levelCapReasonEn =
    'Automatic analysis of transcribed/typed text. Not an official certification.';

  if (refusalLikeAnswers >= 2) {
    ceiling = 'A2';
    levelCapReasonFr =
      'Plusieurs réponses du type « je ne sais pas » ou trop vides : impossible d’attribuer B2 ou plus.';
    levelCapReasonEn =
      'Multiple “I don’t know” / empty-style answers: cannot assign B2 or higher.';
  } else if (refusalLikeAnswers === 1) {
    ceiling = 'B1';
    levelCapReasonFr =
      'Une réponse de refus ou quasi vide : plafonné à B1 (un oral B2+ exige des réponses développées).';
    levelCapReasonEn =
      'One refusal or near-empty answer: capped at B1 (B2+ requires developed answers).';
  } else if (tooShortAnswers >= Math.ceil(list.length * 0.55)) {
    ceiling = 'B1+';
    levelCapReasonFr =
      'La majorité des réponses sont trop courtes pour un niveau solide.';
    levelCapReasonEn = 'Most answers are too short for a strong level claim.';
  } else if (totalWords < 70 || avgWordsPerAnswer < 18) {
    ceiling = 'B1';
    levelCapReasonFr = 'Volume total insuffisant pour valider au-delà de B1.';
    levelCapReasonEn = 'Total volume insufficient to validate above B1.';
  } else if (avgWordsPerAnswer < 32 && targetLevel === 'C1') {
    ceiling = 'B2';
    levelCapReasonFr =
      'Réponses trop courtes pour viser C1 (entretien dense attendu).';
    levelCapReasonEn = 'Answers too short for a C1 target.';
  }

  let estimated: string;
  if (raw >= 74 && targetLevel === 'C1') estimated = 'C1';
  else if (raw >= 64) estimated = 'B2+';
  else if (raw >= 50) estimated = 'B2';
  else if (raw >= 38) estimated = 'B1+';
  else if (raw >= 26) estimated = 'B1';
  else if (raw >= 14) estimated = 'A2';
  else estimated = 'A1';

  estimated = applyCeiling(estimated, ceiling);

  const scorePercent = Math.round(Math.max(4, Math.min(99, raw)));

  const breakdown: OralResultBreakdown = {
    totalWords,
    uniqueWordRatio: Math.round(uniqueWordRatio * 1000) / 1000,
    avgWordsPerAnswer: Math.round(avgWordsPerAnswer * 10) / 10,
    longWordCount,
    strikePenalty,
    refusalLikeAnswers,
    tooShortAnswers,
    contentPenalty: Math.round(contentPenalty),
    levelCapReasonFr,
    levelCapReasonEn,
  };

  return {
    estimatedLevel: estimated,
    summaryFr: `Niveau estimé (contenu analysé) : ${estimated} — score ${scorePercent}%.`,
    summaryEn: `Estimated level (content-based): ${estimated} — score ${scorePercent}%.`,
    scorePercent,
    breakdown,
    disclaimerFr:
      'Pour un niveau « réel » au sens examen officiel, il faut un correcteur humain ou une IA côté serveur. Ce mode pénalise fortement les refus, les réponses courtes et les alertes (changement d’app, plusieurs visages).',
    disclaimerEn:
      'Official-level assessment needs a human or server-side AI. This mode heavily penalizes refusals, short answers, and alerts (app switch, multiple faces).',
  };
}
