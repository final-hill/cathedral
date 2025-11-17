import { z } from 'zod'
import { LanguageToolMatchDto, type LanguageToolMatchDtoType } from '../../../shared/dto/LanguageToolMatchDto.js'

/**
 * LanguageTool API response schemas
 * Based on: https://languagetool.org/http-api/swagger-ui/#!/default/post_check
 * Using Zod for runtime validation and type inference
 */
const LanguageToolMatch = z.object({
        message: z.string(),
        shortMessage: z.string().optional(),
        offset: z.number(),
        length: z.number(),
        replacements: z.array(z.object({ value: z.string() })),
        context: z.object({
            text: z.string(),
            offset: z.number(),
            length: z.number()
        }),
        sentence: z.string().optional(),
        rule: z.object({
            id: z.string(),
            description: z.string(),
            issueType: z.string(),
            category: z.object({
                id: z.string(),
                name: z.string()
            })
        })
    }),
    LanguageToolResponse = z.object({
        software: z.object({
            name: z.string(),
            version: z.string(),
            buildDate: z.string()
        }),
        language: z.object({
            name: z.string(),
            code: z.string()
        }),
        matches: z.array(LanguageToolMatch)
    })

type LanguageToolMatchType = z.infer<typeof LanguageToolMatch>
type LanguageToolResponseType = z.infer<typeof LanguageToolResponse>

/**
 * Options for LanguageTool check requests
 */
export interface LanguageToolCheckOptions {
    enabledCategories?: string[]
    disabledCategories?: string[]
}

/**
 * Service for interacting with LanguageTool API
 * Provides spell checking, grammar checking, and style checking
 * Public API returns DTOs (interfaces), private methods use infrastructure types
 */
export class LanguageToolService {
    private baseUrl: string

    constructor(props: { baseUrl: string }) {
        this.baseUrl = props.baseUrl
    }

    /**
     * Check text specifically for spelling and grammar issues
     * @param props.text - Text to check
     * @param props.language - Language code (default: en-US)
     * @returns Matches as DTOs
     */
    async checkSpellingAndGrammar(props: {
        text: string
        language?: string
    }): Promise<LanguageToolMatchDtoType[]> {
        const { text, language = 'en-US' } = props,
            response = await this.check({
                text,
                language,
                options: {
                    // Enable TYPOS (spelling) and GRAMMAR categories
                    enabledCategories: ['TYPOS', 'GRAMMAR']
                }
            })

        return this.convertMatches(response.matches)
    }

    /**
     * Check text for formal language compliance
     * Uses LanguageTool's formal tone tag
     * @param props.text - Text to check
     * @param props.language - Language code (default: en-US)
     * @returns Matches for informal language as DTOs
     */
    async checkFormalLanguage(props: {
        text: string
        language?: string
    }): Promise<LanguageToolMatchDtoType[]> {
        const { text, language = 'en-US' } = props,
            response = await this.check({
                text,
                language,
                options: {
                    // Enable STYLE category which includes formal language rules
                    enabledCategories: ['STYLE']
                }
            }),
            // Filter for informal language issues
            informalMatches = response.matches.filter((match: LanguageToolMatchType) =>
                match.rule.category.id === 'STYLE'
                && (match.rule.description.toLowerCase().includes('informal')
                    || match.rule.description.toLowerCase().includes('formal')
                    || match.rule.description.toLowerCase().includes('professional'))
            )

        return this.convertMatches(informalMatches)
    }

    /**
     * Check if LanguageTool service is available
     * @returns True if service is healthy
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/v2/languages`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                }
            })

            return response.ok
        } catch {
            return false
        }
    }

    /**
     * Internal method to check text with LanguageTool
     * Returns infrastructure types for internal use only
     * @param props.text - Text to check
     * @param props.language - Language code (default: en-US)
     * @param props.options - Optional check parameters
     * @returns LanguageTool response
     */
    private async check(props: {
        text: string
        language?: string
        options?: LanguageToolCheckOptions
    }): Promise<LanguageToolResponseType> {
        const { text, language = 'en-US', options = {} } = props
        if (!text || text.trim().length === 0)
            return this.emptyResponse(language)

        const params = new URLSearchParams({
            text,
            language,
            // Enable specific tone tags for formal technical writing
            enabledOnly: 'false'
        })

        // Add enabled categories if specified
        if (options?.enabledCategories && options.enabledCategories.length > 0)
            params.append('enabledCategories', options.enabledCategories.join(','))

        // Add disabled categories if specified
        if (options?.disabledCategories && options.disabledCategories.length > 0)
            params.append('disabledCategories', options.disabledCategories.join(','))

        try {
            const response = await fetch(`${this.baseUrl}/v2/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: params
            })

            if (!response.ok)
                throw new Error(`LanguageTool API returned ${response.status}: ${response.statusText}`)

            const jsonData = await response.json(),
                validatedResponse = LanguageToolResponse.parse(jsonData)

            return validatedResponse
        } catch (error) {
            console.error('LanguageTool service error:', error)
            throw new Error(`Failed to check text with LanguageTool: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    /**
     * Convert LanguageTool matches to DTO format
     * Uses Zod schema for validation and transformation
     * @param matches - Raw LanguageTool matches
     * @returns Validated DTO matches
     */
    private convertMatches(matches: LanguageToolMatchType[]): LanguageToolMatchDtoType[] {
        return LanguageToolMatchDto.array().parse(
            matches.map(({ message, offset, length, replacements, rule }) => ({
                message,
                offset,
                length,
                replacements: replacements.map(r => r.value),
                ruleId: rule.id,
                category: rule.category.name
            }))
        )
    }

    /**
     * Create empty response for empty text
     * @param language - Language code
     * @returns Empty response structure
     */
    private emptyResponse(language: string): LanguageToolResponseType {
        return {
            software: {
                name: 'LanguageTool',
                version: 'unknown',
                buildDate: 'unknown'
            },
            language: {
                name: language,
                code: language
            },
            matches: []
        }
    }
}
