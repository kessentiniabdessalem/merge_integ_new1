import { Injectable } from '@angular/core';
import { IncorrectAnswerReview, ResultReview } from './preevaluation-api.service';

export type RecommendationCategory = 'Grammar' | 'Vocabulary' | 'Reading';

/** Placeholder course tile — ready for future real course IDs / routes */
export type PreevalCourseRecommendation = {
  id: string;
  title: string;
  description: string;
  reason: string;
  suggestedLevel: string;
  category: RecommendationCategory;
  /** Lower = higher priority when merging */
  priority: number;
};

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

type CefrLevel = (typeof LEVEL_ORDER)[number];

function normalizeLevel(raw: string | null | undefined): CefrLevel {
  const u = (raw || 'A1').trim().toUpperCase();
  return (LEVEL_ORDER as readonly string[]).includes(u) ? (u as CefrLevel) : 'A1';
}

function nextLevel(l: CefrLevel): CefrLevel | null {
  const i = LEVEL_ORDER.indexOf(l);
  return i >= 0 && i < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[i + 1] : null;
}

type Detector = {
  id: string;
  category: RecommendationCategory;
  priority: number;
  test: (item: IncorrectAnswerReview, blob: string) => boolean;
  title: string;
  description: string;
  buildReason: (finalLevel: string, itemLevel: string) => string;
};

const DETECTORS: Detector[] = [
  {
    id: 'grammar-third-person-s',
    category: 'Grammar',
    priority: 2,
    test: (item) => {
      if (item.category !== 'GRAMMAR') return false;
      const hasSubj = /\b(he|she|it)\b/i.test(item.questionText);
      const c = item.correctAnswerText.trim().toLowerCase();
      const s = item.selectedAnswerText.trim().toLowerCase();
      const ingLike = /ing\b/.test(c);
      if (ingLike) return false;
      return (
        hasSubj &&
        c.length > 1 &&
        s.length > 1 &&
        c !== s &&
        (/\b\w+s\b/.test(c) || /\b\w+es\b/.test(c)) &&
        !/\b\w+s\b/.test(s) &&
        !/\b\w+es\b/.test(s)
      );
    },
    title: 'Present simple — third person (-s / -es)',
    description:
      'Short drills on he/she/it + verb form, contrasts with I/you/we/they, and common spelling patterns.',
    buildReason: (fl, il) =>
      `Your incorrect answers include third-person agreement (e.g. he/she/it + verb). Focus here before harder tenses (levels touched: ${il}, placement ${fl}).`,
  },
  {
    id: 'grammar-present-continuous',
    category: 'Grammar',
    priority: 2,
    test: (item) => {
      if (item.category !== 'GRAMMAR') return false;
      const q = item.questionText.toLowerCase();
      const c = item.correctAnswerText.toLowerCase();
      const timeCue = /\b(now|right now|at the moment|look!|listen!)\b/.test(q);
      const hasIng = /\w+ing\b/.test(c);
      const hasBe = /\b(am|is|are)\b/.test(c);
      return timeCue && hasIng && hasBe;
    },
    title: 'Present continuous (be + -ing)',
    description:
      'Practice forming and choosing present continuous for actions happening now, with clear time clues.',
    buildReason: (fl) =>
      `Mistakes around actions in progress match this topic — consolidate before mixing with present simple (placement ${fl}).`,
  },
  {
    id: 'grammar-past-simple',
    category: 'Grammar',
    priority: 3,
    test: (item) => {
      if (item.category !== 'GRAMMAR') return false;
      const q = item.questionText.toLowerCase();
      return (
        /\b(yesterday|last |ago|in 20\d\d|when i was)\b/.test(q) ||
        /\b(did|was|were|went|had|came|took|bought)\b/.test(item.correctAnswerText.toLowerCase())
      );
    },
    title: 'Past simple — forms and time markers',
    description:
      'Regular/irregular verbs, questions with did, and common past time expressions.',
    buildReason: (fl) =>
      `Your errors relate to past time frames; a focused past-simple block will stabilise narrative sentences (placement ${fl}).`,
  },
  {
    id: 'grammar-articles',
    category: 'Grammar',
    priority: 4,
    test: (item) => {
      if (item.category !== 'GRAMMAR') return false;
      const c = item.correctAnswerText.trim().toLowerCase();
      const s = item.selectedAnswerText.trim().toLowerCase();
      return (
        /^(a|an|the)\s/i.test(c) &&
        /^(a|an|the)\s/i.test(s) === false &&
        item.correctAnswerText.trim().split(/\s+/).length <= 4
      );
    },
    title: 'Articles (a / an / the)',
    description:
      'Choosing articles with countable/uncountable nouns, first mention vs known reference.',
    buildReason: (fl) =>
      `Article choice showed up in your mistakes — short targeted practice removes a common bottleneck (placement ${fl}).`,
  },
  {
    id: 'grammar-modals',
    category: 'Grammar',
    priority: 4,
    test: (item) => {
      if (item.category !== 'GRAMMAR') return false;
      const c = item.correctAnswerText.toLowerCase();
      return /\b(can('t)?|could|must|should|may|might|would|will)\b/.test(c);
    },
    title: 'Modals and semi-modals',
    description:
      'Ability, permission, obligation, and polite requests with can, could, must, should, would.',
    buildReason: (fl) =>
      `Modal verbs appeared in incorrect items — worth isolating meaning and structure (placement ${fl}).`,
  },
  {
    id: 'vocab-opposites',
    category: 'Vocabulary',
    priority: 3,
    test: (item, blob) => {
      if (item.category !== 'VOCABULARY') return false;
      const b = blob.toLowerCase();
      return /\b(opposite|antonym|not the same|contrary)\b/.test(b);
    },
    title: 'Opposites and word relations',
    description:
      'Pairs of adjectives/verbs, prefixes, and quick recognition tasks for contrastive meaning.',
    buildReason: (fl) =>
      `Vocabulary mistakes tied to opposites or contrast — build a small set of high-frequency pairs (placement ${fl}).`,
  },
  {
    id: 'vocab-collocations',
    category: 'Vocabulary',
    priority: 5,
    test: (item, blob) => {
      if (item.category !== 'VOCABULARY') return false;
      return (
        /\b(make|do|take|have|get)\s+(a |an |the |your )?\w+/i.test(item.questionText) ||
        /\bcollocation\b/.test(blob.toLowerCase())
      );
    },
    title: 'Everyday collocations',
    description:
      'Fixed combinations (make a decision, take a break) common in speaking and exams.',
    buildReason: (fl) =>
      `Some errors fit collocation patterns — memorising chunks speeds up listening and writing (placement ${fl}).`,
  },
  {
    id: 'reading-comprehension',
    category: 'Reading',
    priority: 3,
    test: (item) => item.category === 'READING',
    title: 'Reading comprehension — detail and inference',
    description:
      'Short texts with gist, specific detail, and light inference; strategies for underlining clues.',
    buildReason: (fl) =>
      `A reading item was incorrect — extra close-reading practice at ${fl} closes gaps without jumping levels.`,
  },
];

const MAX_RECOMMENDATIONS = 5;

@Injectable({ providedIn: 'root' })
export class PreevaluationCourseRecommendationsService {
  /**
   * Builds 3–5 deduplicated, level-safe placeholder recommendations.
   * No backend call — swap for real course IDs when the Courses module is wired.
   */
  buildRecommendations(review: ResultReview): PreevalCourseRecommendation[] {
    const final = normalizeLevel(review.finalLevel);
    const next = nextLevel(final);
    const byId = new Map<string, PreevalCourseRecommendation>();

    for (const item of review.incorrectAnswers) {
      const blob = `${item.questionText} ${item.selectedAnswerText} ${item.correctAnswerText}`;
      for (const d of DETECTORS) {
        if (!d.test(item, blob)) continue;
        if (byId.has(d.id)) continue;
        byId.set(d.id, {
          id: d.id,
          title: d.title,
          description: d.description,
          reason: d.buildReason(final, item.level),
          suggestedLevel: final,
          category: d.category,
          priority: d.priority,
        });
      }
    }

    this.addGeneralWeakness(review, final, byId);
    this.addReadingFocus(review, final, byId);
    this.addBridgeIfRoom(final, next, byId);

    let list = [...byId.values()].sort((a, b) => a.priority - b.priority).slice(0, MAX_RECOMMENDATIONS);
    if (list.length === 0) {
      list = this.defaultPack(final);
    }
    return list;
  }

  private defaultPack(final: CefrLevel): PreevalCourseRecommendation[] {
    return [
      {
        id: 'default-balanced-grammar',
        title: `Balanced grammar — ${final}`,
        description: `Core structures and accuracy work aligned with ${final} objectives.`,
        reason: `Strong overall result — keep grammar habits fresh at your placement (${final}).`,
        suggestedLevel: final,
        category: 'Grammar',
        priority: 10,
      },
      {
        id: 'default-balanced-vocab',
        title: `Active vocabulary — ${final}`,
        description: `Thematic sets and recall suited to ${final} learners.`,
        reason: `Maintain lexical range so speaking and writing stay comfortable at ${final}.`,
        suggestedLevel: final,
        category: 'Vocabulary',
        priority: 11,
      },
      {
        id: 'default-balanced-reading',
        title: `Graded reading — ${final}`,
        description: `Short texts with comprehension checks at ${final} level.`,
        reason: `Light reading practice preserves inference skills without skipping ahead.`,
        suggestedLevel: final,
        category: 'Reading',
        priority: 12,
      },
    ];
  }

  private addGeneralWeakness(
    review: ResultReview,
    final: CefrLevel,
    byId: Map<string, PreevalCourseRecommendation>
  ): void {
    const add = (
      id: string,
      category: RecommendationCategory,
      title: string,
      description: string,
      reason: string,
      priority: number
    ) => {
      if (byId.has(id)) return;
      byId.set(id, {
        id,
        title,
        description,
        reason,
        suggestedLevel: final,
        category,
        priority,
      });
    };

    if (review.mainWeakness === 'Grammar') {
      add(
        'general-grammar-core',
        'Grammar',
        `Core grammar reinforcement — ${final}`,
        `Structured review of sentence patterns, tense choice, and agreement at ${final}.`,
        `Your main weakness is Grammar — start with a ${final}-aligned grammar track before harder skills.`,
        6
      );
    }
    if (review.secondaryWeakness === 'Vocabulary') {
      add(
        'general-vocabulary-core',
        'Vocabulary',
        `Vocabulary builder — ${final}`,
        `Thematic word sets, spelling, and recognition tasks suited to ${final}.`,
        `Secondary weakness in Vocabulary — parallel vocabulary blocks support Grammar and Reading.`,
        7
      );
    }
    if (review.secondaryWeakness === 'Grammar' && review.mainWeakness !== 'Grammar') {
      add(
        'general-grammar-support',
        'Grammar',
        `Grammar support — ${final}`,
        `Lighter grammar maintenance alongside your main focus, still at ${final}.`,
        `Grammar is a secondary gap — short support modules keep accuracy steady.`,
        8
      );
    }
    if (review.mainWeakness === 'Vocabulary') {
      add(
        'general-vocabulary-main',
        'Vocabulary',
        `Vocabulary focus — ${final}`,
        `High-frequency topics, word families, and recall practice for ${final}.`,
        `Main weakness is Vocabulary — dedicate time to lexical chunks at your placement (${final}).`,
        6
      );
    }
    if (review.secondaryWeakness === 'Reading' && review.mainWeakness !== 'Reading') {
      add(
        'general-reading-support',
        'Reading',
        `Reading practice — ${final}`,
        `Graded texts with comprehension checks at ${final} difficulty.`,
        `Reading is a secondary gap — regular short texts reinforce inference without leaving ${final}.`,
        8
      );
    }
    if (review.mainWeakness === 'Reading') {
      add(
        'general-reading-main',
        'Reading',
        `Reading pathway — ${final}`,
        `Sustained comprehension, scanning, and light inference at ${final} — no jump to higher bands.`,
        `Main weakness is Reading — prioritise graded input at your placement (${final}) before faster texts.`,
        5
      );
    }
  }

  private readingNeedsWork(review: ResultReview): boolean {
    if (review.mainWeakness === 'Reading' || review.secondaryWeakness === 'Reading') return true;
    return /\bneeds improvement\b/i.test(review.readingAssessment);
  }

  private addReadingFocus(
    review: ResultReview,
    final: CefrLevel,
    byId: Map<string, PreevalCourseRecommendation>
  ): void {
    if (!this.readingNeedsWork(review)) return;
    if (
      byId.has('reading-comprehension') ||
      byId.has('reading-focus-weakness') ||
      byId.has('general-reading-main')
    ) {
      return;
    }
    byId.set('reading-focus-weakness', {
      id: 'reading-focus-weakness',
      title: `Reading skills intensive — ${final}`,
      description:
        'Skimming, scanning, and short inference tasks; stays within your assessed band.',
      reason: `Skill focus highlights Reading — prioritise comprehension at ${final} before faster texts.`,
      suggestedLevel: final,
      category: 'Reading',
      priority: 5,
    });
  }

  private addBridgeIfRoom(
    final: CefrLevel,
    next: CefrLevel | null,
    byId: Map<string, PreevalCourseRecommendation>
  ): void {
    if (!next) return;
    const id = 'bridge-next-level-preview';
    if (byId.has(id)) return;
    byId.set(id, {
      id,
      title: `Light preview — ${next} themes (optional)`,
      description:
        `Short introductory exposure only after ${final} reinforcement; not a substitute for level ${final} courses.`,
      reason: `Business rule: master ${final} and weak areas first; use this only when ${final} practice feels solid.`,
      suggestedLevel: next,
      category: 'Grammar',
      priority: 14,
    });
  }
}
