import type { H3Event, EventHandlerRequest } from 'h3'
import type { ZodType } from 'zod'

export default async function validateEventBody<Z extends ZodType>(event: H3Event<EventHandlerRequest>, schema: Z): Promise<Z['_output']> {
    const body = await readValidatedBody(event, (b) => schema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body',
            message: JSON.stringify(body.error.errors)
        })

    return body.data
}