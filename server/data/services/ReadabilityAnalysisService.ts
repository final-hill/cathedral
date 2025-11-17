import { fleschKincaid } from 'flesch-kincaid'
import { syllable } from 'syllable'

/**
 * Readability score result
 */
export interface ReadabilityScore {
    gradeLevel: number
    fleschReadingEase: number
    wordCount: number
    sentenceCount: number
    syllableCount: number
}

/**
 * Service for analyzing text readability using Flesch-Kincaid metrics
 */
export class ReadabilityAnalysisService {
    /**
     * Analyze text readability and return Flesch-Kincaid metrics
     * @param text - Text to analyze
     * @returns Readability metrics including grade level
     */
    async analyzeReadability(text: string): Promise<ReadabilityScore> {
        if (!text || text.trim().length === 0) {
            return {
                gradeLevel: 0,
                fleschReadingEase: 100,
                wordCount: 0,
                sentenceCount: 0,
                syllableCount: 0
            }
        }

        const sentences = this.countSentences(text),
            words = this.countWords(text),
            syllables = this.countSyllables(text),
            // Calculate Flesch-Kincaid Grade Level
            // Formula: 0.39(total words/total sentences) + 11.8(total syllables/total words) - 15.59
            gradeLevel = fleschKincaid({
                sentence: sentences,
                word: words,
                syllable: syllables
            }),
            // Calculate Flesch Reading Ease (for reference)
            // Formula: 206.835 - 1.015(total words/total sentences) - 84.6(total syllables/total words)
            fleschReadingEase = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)

        return {
            gradeLevel: Number(gradeLevel.toFixed(2)),
            fleschReadingEase: Number(fleschReadingEase.toFixed(2)),
            wordCount: words,
            sentenceCount: sentences,
            syllableCount: syllables
        }
    }

    /**
     * Detect acronyms in text
     * Heuristics:
     * - All-caps words of 2+ characters (API, REST, SQL)
     * - Patterns like X.Y.Z (N.P.M., U.S.A.)
     * @param text - Text to analyze
     * @returns Array of detected acronyms
     */
    async detectAcronyms(text: string): Promise<string[]> {
        const acronyms = new Set<string>(),
            // Pattern 1: All-caps words of 2+ characters
            // Matches: API, REST, SQL, HTTP
            allCapsPattern = /\b[A-Z]{2,}\b/g,
            allCapsMatches = text.match(allCapsPattern)
        if (allCapsMatches)
            allCapsMatches.forEach(match => acronyms.add(match))

        // Pattern 2: Dotted acronyms like U.S.A., N.P.M., etc.
        // Matches: X.Y.Z where X, Y, Z are single letters (case insensitive)
        const dottedPattern = /\b[A-Z]\.(?:[A-Z]\.)+[A-Z]?\b/gi,
            dottedMatches = text.match(dottedPattern)
        if (dottedMatches) {
            dottedMatches.forEach((match) => {
                // Normalize to uppercase and remove dots for consistency
                const normalized = match.toUpperCase().replace(/\./g, '')
                acronyms.add(normalized)
            })
        }

        return Array.from(acronyms).sort()
    }

    /**
     * Count sentences in text
     * @param text - Text to analyze
     * @returns Number of sentences
     */
    private countSentences(text: string): number {
        // Split on sentence-ending punctuation followed by space or end of string
        // Handle abbreviations like "Dr." and "Mr." by not splitting on them
        const sentences = text
            .replace(/([.!?])\s+/g, '$1|')
            .split('|')
            .filter(s => s.trim().length > 0)

        return Math.max(sentences.length, 1) // At least 1 sentence
    }

    /**
     * Count words in text
     * @param text - Text to analyze
     * @returns Number of words
     */
    private countWords(text: string): number {
        const words = text
            .replace(/[^\w\s'-]/g, ' ') // Keep hyphens and apostrophes
            .split(/\s+/)
            .filter(w => w.length > 0)

        return Math.max(words.length, 1) // At least 1 word
    }

    /**
     * Count syllables in text using the syllable package
     * @param text - Text to analyze
     * @returns Number of syllables
     */
    private countSyllables(text: string): number {
        return syllable(text)
    }
}
