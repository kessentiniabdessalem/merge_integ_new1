package pi.integrated.quiz.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ProfanityFilterService {
    
    private final Set<String> badWords;
    private final Pattern profanityPattern;
    
    public ProfanityFilterService() {
        this.badWords = initializeBadWords();
        this.profanityPattern = createProfanityPattern();
    }
    
    private Set<String> initializeBadWords() {
        Set<String> words = new HashSet<>();
        
        // Mots inappropriés en français
        words.addAll(Arrays.asList(
            "merde", "putain", "connard", "salaud", "enculé", "fils de pute",
            "va te faire foutre", "bordel", "crétin", "imbécile", "idiot",
            "con", "conne", "salope", "pute", "bite", "couille", "chier",
            "foutre", "baiser", "niquer", "enfoiré", "salopard", "connasse"
        ));
        
        // Mots inappropriés en anglais
        words.addAll(Arrays.asList(
            "fuck", "shit", "bitch", "asshole", "bastard", "damn", "hell",
            "crap", "piss", "cock", "dick", "pussy", "whore", "slut",
            "motherfucker", "son of a bitch", "go to hell", "screw you"
        ));
        
        // Variantes avec caractères spéciaux
        words.addAll(Arrays.asList(
            "f*ck", "sh*t", "b*tch", "a**hole", "d*mn", "h*ll",
            "m3rd3", "put@in", "c0nn@rd", "f**k", "s**t"
        ));
        
        return words;
    }
    
    private Pattern createProfanityPattern() {
        StringBuilder regex = new StringBuilder();
        regex.append("(?i)\\b("); // Case insensitive, word boundary
        
        for (String word : badWords) {
            if (regex.length() > 8) { // More than just the opening
                regex.append("|");
            }
            // Escape special regex characters and allow for character substitutions
            String escapedWord = Pattern.quote(word)
                .replace("\\*", "[*@#$%&!0-9]*")
                .replace("\\@", "[*@#$%&!0-9]*")
                .replace("\\3", "[*@#$%&!0-9e]*")
                .replace("\\0", "[*@#$%&!0-9o]*");
            regex.append(escapedWord);
        }
        
        regex.append(")\\b");
        return Pattern.compile(regex.toString());
    }
    
    /**
     * Vérifie si le texte contient des mots inappropriés
     */
    public boolean containsProfanity(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }
        
        String normalizedText = normalizeText(text);
        return profanityPattern.matcher(normalizedText).find();
    }
    
    /**
     * Filtre et remplace les mots inappropriés par des astérisques
     */
    public String filterProfanity(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        String normalizedText = normalizeText(text);
        return profanityPattern.matcher(normalizedText).replaceAll(match -> {
            return "*".repeat(match.group().length());
        });
    }
    
    /**
     * Retourne la liste des mots inappropriés détectés
     */
    public List<String> detectProfanity(String text) {
        List<String> detectedWords = new ArrayList<>();
        
        if (text == null || text.trim().isEmpty()) {
            return detectedWords;
        }
        
        String normalizedText = normalizeText(text);
        java.util.regex.Matcher matcher = profanityPattern.matcher(normalizedText);
        
        while (matcher.find()) {
            detectedWords.add(matcher.group());
        }
        
        return detectedWords;
    }
    
    /**
     * Valide le contenu et lève une exception si inapproprié
     */
    public void validateContent(String content) throws IllegalArgumentException {
        if (containsProfanity(content)) {
            List<String> badWordsFound = detectProfanity(content);
            throw new IllegalArgumentException(
                "Le contenu contient des mots inappropriés: " + String.join(", ", badWordsFound)
            );
        }
    }
    
    /**
     * Normalise le texte pour la détection (supprime accents, espaces multiples, etc.)
     */
    private String normalizeText(String text) {
        return text
            .toLowerCase()
            .replaceAll("\\s+", " ") // Multiple spaces to single space
            .replaceAll("[àáâãäå]", "a")
            .replaceAll("[èéêë]", "e")
            .replaceAll("[ìíîï]", "i")
            .replaceAll("[òóôõö]", "o")
            .replaceAll("[ùúûü]", "u")
            .replaceAll("[ç]", "c")
            .replaceAll("[ñ]", "n")
            .trim();
    }
    
    /**
     * Ajoute un mot à la liste des mots interdits
     */
    public void addBadWord(String word) {
        badWords.add(word.toLowerCase());
        // Recreate pattern with new word
        // Note: In production, you might want to cache this or use a more efficient approach
    }
    
    /**
     * Supprime un mot de la liste des mots interdits
     */
    public void removeBadWord(String word) {
        badWords.remove(word.toLowerCase());
        // Recreate pattern without the word
    }
    
    /**
     * Retourne la liste des mots interdits (pour administration)
     */
    public Set<String> getBadWords() {
        return new HashSet<>(badWords);
    }
}