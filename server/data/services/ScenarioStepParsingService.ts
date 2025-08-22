import { AzureOpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { dedent } from '../../../shared/utils/dedent.js'
import { z } from 'zod'
import { JSDOM } from 'jsdom'
import { ScenarioStepTypeEnum } from '~/shared/domain/requirements/ScenarioStepTypeEnum.js'

// Schema for parsing scenario steps from natural language
const scenarioStepParseSchema = z.object({
    parseable: z.boolean().describe('Whether the content can be interpreted as scenario steps'),
    steps: z.array(z.object({
        stepNumber: z.string().describe('Hierarchical step identifier (e.g., "1", "2.1", "3.1.2")'),
        content: z.string().describe('The text content of the step'),
        stepType: z.nativeEnum(ScenarioStepTypeEnum).describe('Whether this is an action or conditional branch')
    })).describe('Array of parsed steps. Empty if content is not parseable.')
})

export type ParsedScenarioStep = z.infer<typeof scenarioStepParseSchema>['steps'][0]
export type ScenarioStepParseResult = z.infer<typeof scenarioStepParseSchema>

export class ScenarioStepParsingService {
    private _aiClient: AzureOpenAI
    private _modelId: string

    constructor(props: { apiKey: string, apiVersion: string, endpoint: string, deployment: string }) {
        this._aiClient = new AzureOpenAI(props)
        this._modelId = props.deployment
    }

    /**
     * Parse scenario steps from HTML content and return structured steps
     */
    async parseScenarioSteps(htmlContent: string): Promise<ScenarioStepParseResult> {
        // Extract plain text from HTML
        const plainText = this.extractTextFromHtml(htmlContent)

        if (!plainText.trim())
            return { parseable: false, steps: [] }

        const completion = await this._aiClient.chat.completions.create({
                model: this._modelId,
                messages: [{
                    role: 'system',
                    content: dedent(`
                    You are an expert at parsing use case scenario steps from natural language text.

                    Your task is to:
                    1. Determine if the content represents scenario steps or is nonsensical/irrelevant
                    2. If parseable: Parse numbered/bulleted text into structured scenario steps
                    3. If parseable: Determine correct hierarchical numbering (1, 2, 2.1, 2.2, 3, etc.)
                    4. If parseable: Classify each step as either "Action" or "Condition"
                    5. If parseable: Handle malformed numbering by auto-correcting to proper sequence
                    6. If parseable: Preserve the user's original text content while fixing structure

                    Content is NOT parseable if it contains:
                    - Random gibberish, meaningless text, or keyboard mashing
                    - Pure questions without actionable steps (e.g., "What should I do?")
                    - Completely unrelated content (e.g., recipes, poetry, code)
                    - Single words or very short phrases without context
                    - Content that makes no sense in a use case scenario context

                    Content IS parseable if it contains:
                    - Action-oriented statements, even if informal
                    - Conditional statements or decision points
                    - Any sequence of activities or behaviors
                    - User interactions or system responses
                    - Even poorly formatted but recognizable step-like content

                    Step Types (only if parseable):
                    - ACTION: A concrete action taken by an actor or system (e.g., "User clicks submit button")
                    - CONDITION: A conditional branch or decision point (e.g., "If data is invalid")

                    Rules (only if parseable):
                    - Main steps should be numbered 1, 2, 3, etc.
                    - Sub-steps should be 1.1, 1.2, 2.1, 2.2, etc.
                    - Further nesting: 1.1.1, 1.1.2, etc.
                    - Ignore user's existing numbering if malformed
                    - Preserve original text content exactly
                    - Infer step type from content context
                    - The stepNumber field should contain the hierarchical identifier (indentation is implicit)

                    If not parseable, set parseable=false and return empty steps array.
                `)
                }, {
                    role: 'user',
                    content: `Parse this scenario text into structured steps:\n\n${plainText}`
                }],
                response_format: zodResponseFormat(scenarioStepParseSchema, 'scenario_steps')
            }),

            result = completion.choices[0].message

        if (result.refusal)
            throw new Error(`AI refused to parse: ${result.refusal}`)

        if (!result.content)
            throw new Error('No content returned from AI service')

        const parsed = JSON.parse(result.content)
        return parsed
    }

    /**
     * Extract plain text from HTML content using jsdom for proper parsing
     */
    private extractTextFromHtml(html: string): string {
        if (!html?.trim())
            return ''

        const dom = new JSDOM(html),
            document = dom.window.document,
            textContent = document.body?.textContent || document.textContent || ''

        return textContent
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/\n\s*\n/g, '\n') // Remove extra newlines
            .trim()
    }
}
