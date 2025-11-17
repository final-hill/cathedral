import { AzureOpenAI } from 'openai'
import { dedent } from '../../../shared/utils/dedent.js'
import type { ReqType } from '../../../shared/domain/index.js'
import * as reqs from '../../../shared/domain/requirements/index.js'
import { snakeCaseToPascalCase } from '../../../shared/utils/index.js'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

/**
 * Zod schema for type correspondence validation result
 */
export const TypeCorrespondenceResult = z.object({
    isValid: z.boolean()
        .describe('Whether the requirement content matches expectations for its type'),
    issues: z.array(z.string())
        .describe('List of issues found with type correspondence'),
    suggestions: z.array(z.string())
        .describe('List of suggestions to improve type correspondence')
})

export type TypeCorrespondenceResultType = z.infer<typeof TypeCorrespondenceResult>

/**
 * Content to validate for type correspondence
 */
export interface RequirementContent {
    reqType: ReqType
    name: string
    description?: string
    [key: string]: unknown
}

/**
 * Service for validating that requirement content matches its declared type
 * Uses Azure OpenAI to analyze requirement text and ensure it aligns with type expectations
 */
export class RequirementTypeCorrespondenceService {
    private aiClient: AzureOpenAI
    private modelId: string

    constructor(props: { apiKey: string, apiVersion: string, endpoint: string, deployment: string }) {
        this.aiClient = new AzureOpenAI(props)
        this.modelId = props.deployment
    }

    /**
     * Validate that requirement content corresponds to its type
     * @param content - Requirement content to validate
     * @returns Validation result with issues and suggestions
     */
    async validateTypeCorrespondence(content: RequirementContent): Promise<TypeCorrespondenceResultType> {
        const reqType = content.reqType,
            systemPrompt = this.buildSystemPrompt({ reqType, content }),
            userPrompt = this.buildUserPrompt(content)

        try {
            const completion = await this.aiClient.chat.completions.create({
                    model: this.modelId,
                    temperature: 0.3, // Lower temperature for more consistent analysis
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: userPrompt
                        }
                    ],
                    response_format: zodResponseFormat(TypeCorrespondenceResult, 'type_correspondence')
                }),
                choice = completion.choices[0]

            if (!choice)
                throw new Error('No completion choice returned from Azure OpenAI')

            const result = choice.message

            if (result.refusal)
                throw new Error(result.refusal)

            if (!result.content)
                throw new Error('No content in response')

            return TypeCorrespondenceResult.parse(JSON.parse(result.content))
        } catch (error) {
            console.error('Type correspondence validation error:', error)
            throw new Error(`Failed to validate type correspondence: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    /**
     * Build a system prompt for type correspondence validation
     * @param props.reqType - The requirement type to validate against
     * @param props.content - The requirement content to analyze
     * @returns System prompt for AI
     */
    private buildSystemPrompt(props: {
        reqType: ReqType
        content: RequirementContent
    }): string {
        const { reqType } = props,
            typeGuidelines = this.getTypeGuidelines(reqType),
            ReqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof reqs,
            typeDescription = reqs[ReqTypePascal]?.description || 'Unknown requirement type'

        return dedent(`
            You are an expert requirements engineer analyzing whether a requirement's content
            corresponds appropriately to its declared type.

            Requirement Type: ${reqType}
            Type Description: ${typeDescription}

            ${typeGuidelines}

            Your task is to analyze the provided requirement content and determine:
            1. Whether the content aligns with expectations for this requirement type
            2. Specific issues where the content doesn't match the type
            3. Suggestions for improving type correspondence

            Be specific and actionable in your feedback. Consider the requirement's:
            - Name/title appropriateness for the type
            - Description content and structure
            - Use of appropriate language and terminology for the type
            - Presence of expected elements for the type
        `)
    }

    /**
     * Get guidelines from the Zod schema definition for a requirement type
     * Extracts the schema description directly from the domain
     * @param reqType - Requirement type
     * @returns Type-specific guidelines from schema metadata
     */
    private getTypeGuidelines(reqType: ReqType): string {
        const ReqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof reqs,

            // Get the Zod schema for this type
            schema = reqs[ReqTypePascal]

        if (!schema || typeof schema !== 'object')
            return 'No specific guidelines available for this requirement type.'

        // Extract schema-level description
        const schemaDescription = schema.description

        return schemaDescription || 'No specific guidelines available for this requirement type.'
    }

    /**
     * Build user prompt with requirement content
     * @param content - Requirement content
     * @returns User prompt
     */
    private buildUserPrompt(content: RequirementContent): string {
        const fields = Object.entries(content)
            .filter(([key]) => !['reqType'].includes(key))
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')

        return dedent(`
            Analyze this requirement for type correspondence:

            ${fields}

            Provide your analysis in the specified JSON format.
        `)
    }
}
