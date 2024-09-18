import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod";
import zodSchema from '../../data/llm-zod-schemas'
import { AzureOpenAI } from "openai";
import zodToJsonSchema from "zod-to-json-schema";
import { ParsedRequirements } from "~/server/domain/application/index";
import { fork } from "~/server/data/orm";

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    statement: z.string().max(1000, 'Requirement must be less than or equal to 1000 characters')
})

/**
 * Parse requirements from a statement, save the parsed requirements to the database,
 * and return the number of requirements parsed.
 */
export default defineEventHandler(async (event) => {
    const { statement, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const aiClient = new AzureOpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION,
        endpoint: process.env.AZURE_OPENAI_ENDPOINT
    })

    // https://techcommunity.microsoft.com/t5/ai-azure-ai-services-blog/introducing-gpt-4o-2024-08-06-api-with-structured-outputs-on/ba-p/4232684
    // https://hooshmand.net/zod-zodresponseformat-structured-outputs-openai/
    // https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/structured-outputs?tabs=python-secure
    const completion = await aiClient.beta.chat.completions.parse({
        // temperature: 0,
        model: process.env.AZURE_OPENAI_DEPLOYMENT_ID!,
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

    const result = completion.choices[0].message.parsed;

    const parsedRequirements = new ParsedRequirements({
        solution,
        statement,
        submittedBy: sessionUser,
        submittedAt: new Date(),
        jsonResult: result
    })

    await em.persistAndFlush(parsedRequirements)

    return result?.requirements.length ?? 0
})