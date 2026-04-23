import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfanityFilterService {
  
  private readonly badWords: Set<string> = new Set();
  private profanityRegex!: RegExp;

  constructor() {
    this.initializeBadWords();
    this.createProfanityRegex();
  }

  private initializeBadWords(): void {
    // Mots inappropriés en français
    const frenchBadWords = [
      'merde', 'putain', 'connard', 'salaud', 'enculé', 'fils de pute',
      'va te faire foutre', 'bordel', 'crétin', 'imbécile', 'idiot',
      'con', 'conne', 'salope', 'pute', 'bite', 'couille', 'chier',
      'foutre', 'baiser', 'niquer', 'enfoiré', 'salopard', 'connasse'
    ];

    // Mots inappropriés en anglais
    const englishBadWords = [
      'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'hell',
      'crap', 'piss', 'cock', 'dick', 'pussy', 'whore', 'slut',
      'motherfucker', 'son of a bitch', 'go to hell', 'screw you'
    ];

    // Variantes avec caractères spéciaux
    const variants = [
      'f*ck', 'sh*t', 'b*tch', 'a**hole', 'd*mn', 'h*ll',
      'm3rd3', 'put@in', 'c0nn@rd', 'f**k', 's**t'
    ];

    [...frenchBadWords, ...englishBadWords, ...variants].forEach(word => {
      this.badWords.add(word.toLowerCase());
    });
  }

  private createProfanityRegex(): void {
    const escapedWords = Array.from(this.badWords).map(word => {
      // Échapper les caractères spéciaux et permettre les substitutions
      return word
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Échapper les caractères regex
        .replace(/\\\*/g, '[*@#$%&!0-9]*') // Permettre les substitutions
        .replace(/\\\@/g, '[*@#$%&!0-9]*')
        .replace(/3/g, '[3e]*')
        .replace(/0/g, '[0o]*');
    });

    const pattern = `\\b(${escapedWords.join('|')})\\b`;
    this.profanityRegex = new RegExp(pattern, 'gi');
  }

  /**
   * Vérifie si le texte contient des mots inappropriés
   */
  containsProfanity(text: string): boolean {
    if (!text || text.trim().length === 0) {
      return false;
    }

    const normalizedText = this.normalizeText(text);
    return this.profanityRegex.test(normalizedText);
  }

  /**
   * Filtre et remplace les mots inappropriés par des astérisques
   */
  filterProfanity(text: string): string {
    if (!text || text.trim().length === 0) {
      return text;
    }

    const normalizedText = this.normalizeText(text);
    return normalizedText.replace(this.profanityRegex, (match) => {
      return '*'.repeat(match.length);
    });
  }

  /**
   * Détecte et retourne les mots inappropriés trouvés
   */
  detectProfanity(text: string): string[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const normalizedText = this.normalizeText(text);
    const matches = normalizedText.match(this.profanityRegex);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Valide le contenu et retourne un message d'erreur si inapproprié
   */
  validateContent(text: string): { isValid: boolean; message?: string; detectedWords?: string[] } {
    if (!text || text.trim().length === 0) {
      return { isValid: true };
    }

    const detectedWords = this.detectProfanity(text);
    
    if (detectedWords.length > 0) {
      return {
        isValid: false,
        message: 'Votre commentaire contient des mots inappropriés. Veuillez le modifier.',
        detectedWords
      };
    }

    return { isValid: true };
  }

  /**
   * Normalise le texte pour la détection
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ') // Espaces multiples vers espace simple
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .trim();
  }

  /**
   * Ajoute un mot à la liste des mots interdits
   */
  addBadWord(word: string): void {
    this.badWords.add(word.toLowerCase());
    this.createProfanityRegex();
  }

  /**
   * Supprime un mot de la liste des mots interdits
   */
  removeBadWord(word: string): void {
    this.badWords.delete(word.toLowerCase());
    this.createProfanityRegex();
  }

  /**
   * Retourne la liste des mots interdits (pour administration)
   */
  getBadWords(): string[] {
    return Array.from(this.badWords);
  }
}