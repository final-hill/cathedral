import { AzureOpenAI } from 'openai'
import { z } from 'zod'
import { dedent } from '../../../shared/utils/dedent.js'

/**
 * Zod schema for AI-identified terms
 */
const TermsOfArtResult = z.object({
    terms: z.array(z.string())
        .describe('All terms that warrant glossary definitions: acronyms, domain-specific terms, technical jargon, and specialized vocabulary')
})

/**
 * Service for identifying terms that should be defined in a glossary
 * Uses Azure OpenAI to analyze requirement text and extract domain-specific terminology
 */
export class GlossaryTermIdentificationService {
    private aiClient: AzureOpenAI
    private modelId: string

    constructor(props: { apiKey: string, apiVersion: string, endpoint: string, deployment: string }) {
        this.aiClient = new AzureOpenAI(props)
        this.modelId = props.deployment
    }

    /**
     * Identify terms in the text that should have glossary definitions
     * @param text - Text to analyze
     * @returns Array of identified terms that warrant glossary entries
     */
    async identifyTerms(text: string): Promise<string[]> {
        const systemPrompt = dedent(`
                You are a requirements engineering expert analyzing requirement documents.
                Your task is to identify ALL terms that should be defined in a glossary to ensure stakeholder understanding.

                Focus on:
                - Acronyms and initialisms (e.g., "API", "REST", "SQL", "HTTP")
                - Technical terms specific to the domain (e.g., "meteorological data", "satellite imagery")
                - Industry-specific jargon (e.g., "real-time data streaming", "mobile responsiveness")
                - Specialized concepts that non-experts may not understand
                - Multi-word phrases that represent specific concepts (e.g., "ground-based sensors")
                - Terms that are central to understanding the requirement

                Exclude:
                - Common words and generic terminology
                - Generic software terms everyone understands (e.g., "application", "data", "browser")
                - Verbs and adjectives unless they're part of a technical term

                Return ALL terms (including acronyms) that truly warrant a glossary entry for stakeholder clarity.
            `),
            userPrompt = `Analyze this requirement text and identify ALL terms that should be in a glossary:\n\n${text}`

        try {
            const completion = await this.aiClient.chat.completions.create({
                    model: this.modelId,
                    temperature: 0.2, // Low temperature for consistent extraction
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    response_format: {
                        type: 'json_schema',
                        json_schema: {
                            name: 'terms_of_art',
                            strict: true,
                            schema: z.toJSONSchema(TermsOfArtResult, { target: 'openapi-3.0' })
                        }
                    }
                }),
                choice = completion.choices[0]

            if (!choice)
                throw new Error('No completion choice returned from Azure OpenAI')

            const result = choice.message

            if (result.refusal)
                throw new Error(result.refusal)

            if (!result.content)
                throw new Error('No content in response')

            const parsed = TermsOfArtResult.parse(JSON.parse(result.content))
            return parsed.terms
        } catch (error) {
            console.error('Error identifying terms of art:', error)
            throw new Error(`Failed to identify glossary terms: ${error instanceof Error ? error.message : String(error)}`)
        }
    }
}
