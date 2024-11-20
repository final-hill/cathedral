import { AzureOpenAI } from "openai";
import { v7 as uuidv7 } from 'uuid';
import zodToJsonSchema from "zod-to-json-schema";
import zodSchema from '../llm-zod-schemas/index.js'
import { zodResponseFormat } from "openai/helpers/zod";
import { dedent, groupBy } from "#shared/utils";

type LLMResponseType = typeof zodSchema['_type']['requirements']
type ArrayToUnion<T> = T extends (infer U)[] ? U : never
type ExtractGroupItem<T extends string> = Extract<ArrayToUnion<LLMResponseType>, { type: T }> & { id: string }
export type ParsedRequirementGroup = {
    [K in ArrayToUnion<LLMResponseType>['type']]?: ExtractGroupItem<K>[]
}

export default class NaturalLanguageToRequirementService {
    private _aiClient: AzureOpenAI;
    private _modelId: string;

    constructor(props: { apiKey: string, apiVersion: string, endpoint: string, modelId: string }) {
        this._aiClient = new AzureOpenAI(props)
        this._modelId = props.modelId
    }

    async parse(statement: string): Promise<ParsedRequirementGroup> {
        // https://techcommunity.microsoft.com/t5/ai-azure-ai-services-blog/introducing-gpt-4o-2024-08-06-api-with-structured-outputs-on/ba-p/4232684
        // https://hooshmand.net/zod-zodresponseformat-structured-outputs-openai/
        // https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/structured-outputs?tabs=python-secure
        const completion = await this._aiClient.beta.chat.completions.parse({
            // temperature: 0,
            model: this._modelId,
            messages: [
                {
                    role: "system",
                    content: dedent(`
                    Your role is to parse Requirements from user input and derive any strongly implied requirements.
                    Requirements are defined by the following json schema:

                    """
                    ${zodToJsonSchema(zodSchema, 'requirements')}
                    """

                    Any statement or substatement that can not be expressed or understood should be considered a Silence.
                `)
                },
                {
                    role: "user",
                    content: statement
                }
            ],
            response_format: zodResponseFormat(zodSchema, 'requirements')
        })

        const result = (completion.choices[0].message.parsed?.requirements ?? [])
            .map((req) => ({ ...req, id: uuidv7() }));

        return groupBy(result, ({ type }) => type) as ParsedRequirementGroup
    }
}