import { z } from 'zod'
import { LanguageToolMatchDto } from '../../dto/LanguageToolMatchDto.js'
import { ReviewItem } from './ReviewItem.js'
import { ReviewCategory } from './ReviewCategory.js'
import { AutomatedCheckDetails } from './AutomatedCheckDetails.js'

/**
 * Readability check types
 * Defines the specific automated checks performed for the READABILITY category
 */
export enum ReadabilityCheckType {
    SPELLING_GRAMMAR = 'spelling_grammar', // Check for spelling and grammar issues
    READABILITY_SCORE = 'readability_score', // Check for overall readability score
    GLOSSARY_COMPLIANCE = 'glossary_compliance', // Check for compliance with defined glossary terms
    FORMAL_LANGUAGE = 'formal_language', // Check for use of formal/professional language
    TYPE_CORRESPONDENCE = 'type_correspondence' // Check for correspondence between requirement content and its type
}

/**
 * Readability check details for different check types
 * Extends AutomatedCheckDetails base schema with READABILITY-specific fields
 */
export const ReadabilityCheckDetails = AutomatedCheckDetails.extend({
    checkType: z.nativeEnum(ReadabilityCheckType)
        .describe('Type of readability check performed'),
    // Spelling & Grammar
    languageToolMatches: z.array(LanguageToolMatchDto).optional()
        .describe('Issues found by LanguageTool'),
    // Readability Score
    fleschKincaidScore: z.number().optional()
        .describe('Flesch Reading Ease score'),
    gradeLevel: z.number().optional()
        .describe('Flesch-Kincaid Grade Level'),
    threshold: z.number().optional()
        .describe('Maximum acceptable grade level for this requirement type'),
    passed: z.boolean().optional()
        .describe('Whether the readability threshold was met'),
    // Glossary Compliance
    undefinedTerms: z.array(z.string()).optional()
        .describe('Acronyms and technical terms not found in glossary'),
    suggestedGlossaryTerms: z.array(z.string()).optional()
        .describe('Terms that should be added to glossary'),
    // Formal Language
    informalPhrases: z.array(z.object({
        text: z.string(),
        suggestion: z.string().optional()
    })).optional()
        .describe('Informal language detected'),
    // Type Correspondence
    typeCorrespondenceIssues: z.array(z.string()).optional()
        .describe('Issues with requirement content not matching its type')
}).describe('Detailed results from a readability check')

export type ReadabilityCheckDetailsType = z.infer<typeof ReadabilityCheckDetails>

/**
 * Readability review item extends the base review item with automated check details
 * This is the specific review item type for READABILITY category automated checks
 */
export const ReadabilityReviewItem = ReviewItem.extend({
    category: z.literal(ReviewCategory.READABILITY),
    checkDetails: ReadabilityCheckDetails
}).describe('Automated readability check review item')

export type ReadabilityReviewItemType = z.infer<typeof ReadabilityReviewItem>
