import type { H3Event, EventHandlerRequest } from 'h3'
import type { ZodUnion, ZodObject, ZodEffects } from 'zod'

export default async function validateEventBody<Z extends ZodObject<any> | ZodUnion<any> | ZodEffects<any>>(event: H3Event<EventHandlerRequest>, schema: Z): Promise<Z['_output']> {
    const body = await readValidatedBody(event, (b) => schema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body',
            message: JSON.stringify(body.error.errors)
        })

    return body.data
}