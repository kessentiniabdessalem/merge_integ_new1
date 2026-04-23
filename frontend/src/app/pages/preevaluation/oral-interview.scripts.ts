/** Scripts d'entretien oral type certification / entretien professionnel (démo front). */

export type OralInterviewLang = 'fr' | 'en';
export type OralInterviewLevel = 'B2' | 'C1';

export type OralInterviewPrompt = {
  id: string;
  /** Texte lu par la synthèse vocale (examinatrice / examinateur IA) */
  examinerText: string;
  /** Consigne affichée pour le candidat */
  candidateHint: string;
  /** Temps conseillé pour répondre (secondes) */
  suggestedAnswerSeconds: number;
};

const FR_B2: OralInterviewPrompt[] = [
  {
    id: 'fr-b2-1',
    examinerText:
      'Bonjour. Pour commencer cet entretien de niveau B2, présentez-vous en quelques phrases : votre parcours, ce que vous faites actuellement, et ce qui vous motive à améliorer votre français.',
    candidateHint: 'Présentez-vous de façon structurée (2 à 3 minutes).',
    suggestedAnswerSeconds: 120,
  },
  {
    id: 'fr-b2-2',
    examinerText:
      'Merci. Décrivez une situation professionnelle ou académique récente où vous avez dû résoudre un problème avec d’autres personnes. Quel était l’enjeu et qu’avez-vous fait concrètement ?',
    candidateHint: 'Soyez précis : contexte, actions, résultat.',
    suggestedAnswerSeconds: 120,
  },
  {
    id: 'fr-b2-3',
    examinerText:
      'Passons à l’argumentation. Pensez-vous que le télétravail soit avantageux pour la plupart des métiers ? Expliquez votre position avec au moins deux arguments et un exemple.',
    candidateHint: 'Structurez : opinion, arguments, exemple, conclusion courte.',
    suggestedAnswerSeconds: 120,
  },
  {
    id: 'fr-b2-4',
    examinerText:
      'Dernière question. Imaginez que vous écrivez un e-mail formel à un responsable pour demander un délai supplémentaire. Résumez à l’oral le ton et les éléments essentiels que vous incluriez.',
    candidateHint: 'Vous pouvez lister salutations, motif, demande polie, formule de clôture.',
    suggestedAnswerSeconds: 90,
  },
];

const FR_C1: OralInterviewPrompt[] = [
  {
    id: 'fr-c1-1',
    examinerText:
      'Bonjour. Cet entretien vise le niveau C1. Dans un premier temps, analysez les avantages et les limites d’une politique de quotas dans le recrutement, en nuançant votre propos.',
    candidateHint: 'Montrez la nuance, les contre-arguments, et une conclusion équilibrée.',
    suggestedAnswerSeconds: 150,
  },
  {
    id: 'fr-c1-2',
    examinerText:
      'Évoquez un débat sociétal qui vous préoccupe. Expliquez les positions en présence et la manière dont vous situeriez votre regard critique.',
    candidateHint: 'Vocabulaire soutenu et organisation logique attendus.',
    suggestedAnswerSeconds: 150,
  },
  {
    id: 'fr-c1-3',
    examinerText:
      'Comment articuleriez-vous la régulation des contenus en ligne avec la liberté d’expression ? Proposez un cadre réaliste sans simplifier à l’excès.',
    candidateHint: 'Développez plusieurs perspectives avant de conclure.',
    suggestedAnswerSeconds: 150,
  },
];

const EN_B2: OralInterviewPrompt[] = [
  {
    id: 'en-b2-1',
    examinerText:
      'Hello. This is a B2-level oral interview. Please introduce yourself briefly: your background, your current role or studies, and why you want to improve your English.',
    candidateHint: 'Speak clearly for about two minutes.',
    suggestedAnswerSeconds: 120,
  },
  {
    id: 'en-b2-2',
    examinerText:
      'Thank you. Describe a recent situation where you had to work with others under pressure. What was the challenge, what did you do, and what was the outcome?',
    candidateHint: 'Use past tenses and specific examples.',
    suggestedAnswerSeconds: 120,
  },
  {
    id: 'en-b2-3',
    examinerText:
      'Now, to what extent do you think remote work should remain the default for office jobs? Give two arguments on each side, then state your view.',
    candidateHint: 'Structure: advantages, disadvantages, conclusion.',
    suggestedAnswerSeconds: 120,
  },
  {
    id: 'en-b2-4',
    examinerText:
      'Finally, imagine you need to complain politely but firmly about a delayed service. Outline how you would open the conversation and what you would ask for.',
    candidateHint: 'Focus on tone and clarity.',
    suggestedAnswerSeconds: 90,
  },
];

const EN_C1: OralInterviewPrompt[] = [
  {
    id: 'en-c1-1',
    examinerText:
      'Good morning. This interview targets C1. Discuss the trade-offs between economic growth and environmental protection, without reducing the issue to slogans.',
    candidateHint: 'Show balance, nuance, and precise vocabulary.',
    suggestedAnswerSeconds: 150,
  },
  {
    id: 'en-c1-2',
    examinerText:
      'How would you critically assess the impact of artificial intelligence on creative industries? Address both opportunity and risk with concrete illustrations.',
    candidateHint: 'Develop a clear line of argument.',
    suggestedAnswerSeconds: 150,
  },
  {
    id: 'en-c1-3',
    examinerText:
      'Closing question: if you had to design a fair policy for international student mobility, what principles would guide you and what pitfalls would you avoid?',
    candidateHint: 'Aim for synthesis and evaluation, not mere listing.',
    suggestedAnswerSeconds: 150,
  },
];

export function getOralInterviewScript(
  lang: OralInterviewLang,
  level: OralInterviewLevel
): OralInterviewPrompt[] {
  const map: Record<OralInterviewLang, Record<OralInterviewLevel, OralInterviewPrompt[]>> = {
    fr: { B2: FR_B2, C1: FR_C1 },
    en: { B2: EN_B2, C1: EN_C1 },
  };
  return map[lang][level];
}

export function ttsLocaleForLang(lang: OralInterviewLang): string {
  return lang === 'fr' ? 'fr-FR' : 'en-US';
}

export function sttLangForLang(lang: OralInterviewLang): string {
  return lang === 'fr' ? 'fr-FR' : 'en-US';
}
