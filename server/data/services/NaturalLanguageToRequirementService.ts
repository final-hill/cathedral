import { AzureOpenAI } from "openai";
import { v7 as uuidv7 } from 'uuid';
import zodToJsonSchema from "zod-to-json-schema";
import zodSchema, { llmRequirementSchema } from '../llm-zod-schemas/index.js'
import { zodResponseFormat } from "openai/helpers/zod";
import { dedent } from "../../../shared/utils/dedent.js";
import { z } from "zod";
import { ReqType } from "~/shared/domain/index.js";
import * as reqs from '~/shared/domain/requirements/index.js';
import { snakeCaseToPascalCase } from "~/shared/utils/snakeCaseToPascalCase.js";


export default class NaturalLanguageToRequirementService {
    private _aiClient: AzureOpenAI;
    private _modelId: string;

    constructor(props: { apiKey: string, apiVersion: string, endpoint: string, deployment: string }) {
        this._aiClient = new AzureOpenAI(props)
        this._modelId = props.deployment
    }

    async parse(statement: string): Promise<z.infer<typeof llmRequirementSchema>[]> {
        // https://techcommunity.microsoft.com/t5/ai-azure-ai-services-blog/introducing-gpt-4o-2024-08-06-api-with-structured-outputs-on/ba-p/4232684
        // https://hooshmand.net/zod-zodresponseformat-structured-outputs-openai/
        // https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/structured-outputs?tabs=python-secure
        const completion = await this._aiClient.chat.completions.create({
            // temperature: 0,
            model: this._modelId,
            messages: [{
                role: 'system', content: dedent(`
                Your role is to distill requirements from user input.
                The Requirements fall into the following categories:

                """
                ${Object.values(ReqType)
                        .filter((reqType) => ![
                            ReqType.COMPONENT,
                            ReqType.CONTEXT_AND_OBJECTIVE,
                            ReqType.FUNCTIONALITY,
                            ReqType.META_REQUIREMENT,
                            ReqType.ORGANIZATION,
                            ReqType.PARSED_REQUIREMENTS,
                            ReqType.REQUIREMENT,
                            ReqType.SOLUTION,
                        ].includes(reqType))
                        .map((reqType) => {
                            const ReqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof reqs
                            return { reqType, description: reqs[ReqTypePascal].description }
                        })
                        .map(({ reqType, description }) => `- ${reqType}: ${description}`)
                        .join('\n')
                    }
                """

                Any statement or substatement that can not be expressed or understood as a requirement should be considered a 'silence' requirement.
                Set the description of the silence requirement to the offending statement.

                The requirements should be a json object. The provided schema represented in a form analagous to
                Single Table Inheritance (STI) in database design; A number of fields are common to all requirements,
                and some fields are specific to each requirement type and should be left as null if not applicable
                to the requirement type.
            `)
            }, {
                role: 'user', content: statement
            }],
            response_format: zodResponseFormat(zodSchema, 'requirements')

        })

        const result = completion.choices[0].message

        if (result.refusal)
            throw new Error(result.refusal)

        if (!result.content)
            throw null

        return JSON.parse(result.content).requirements
    }
}