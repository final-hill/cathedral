import { z } from 'zod'

/**
 * DTO for a LanguageTool match result
 * Used to transfer LanguageTool analysis results from services to the application layer
 * This is a simplified version of the full LanguageTool API response
 */
export const LanguageToolMatchDto = z.object({
    message: z.string()
        .describe('Description of the issue'),
    offset: z.number()
        .describe('Character offset where the issue starts'),
    length: z.number()
        .describe('Length of the problematic text'),
    replacements: z.array(z.string())
        .describe('Suggested replacements'),
    ruleId: z.string()
        .describe('LanguageTool rule identifier'),
    category: z.string()
        .describe('Category of the issue (spelling, grammar, style, etc.)')
}).describe('Simplified LanguageTool match for transfer between layers')

export type LanguageToolMatchDtoType = z.infer<typeof LanguageToolMatchDto>
