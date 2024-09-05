import type { H3Event, EventHandlerRequest } from 'h3'
import type { ZodUnion, ZodObject, ZodEffects } from 'zod'

export default async function validateEventQuery<Z extends ZodObject<any> | ZodUnion<any> | ZodEffects<any>>(event: H3Event<EventHandlerRequest>, schema: Z): Promise<Z['_output']> {
    const query = await getValidatedQuery(event, (q) => schema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid query parameters',
            message: JSON.stringify(query.error.errors)
        })

    return query.data
}