import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod";
import zodSchema from '../../data/zod-schemas'
import { AzureOpenAI } from "openai";

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    statement: z.string().max(1000, 'Requirement must be less than or equal to 1000 characters')
})

export default defineEventHandler(async (event) => {
    const { statement, solutionId } = await validateEventBody(event, bodySchema),
        { } = await assertSolutionContributor(event, solutionId)

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
                    Your role is to parse Requirements from user input.
                    A valid Requirement is a Stakeholder or Silence.
                    Any statement or substatement that can not be expressed or understood should be considered a Silence.
                `)
            },
            {
                role: "user",
                content: statement.trim()
            }
        ],
        response_format: zodResponseFormat(zodSchema, 'requirements')
    })

    const result = completion.choices[0].message.parsed;

    return result
})