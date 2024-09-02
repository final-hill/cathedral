import type { H3Event, EventHandlerRequest } from 'h3'
import type { ZodUnion, ZodObject, ZodEffects } from 'zod'

export default async function validateEventParams<Z extends ZodObject<any> | ZodUnion<any> | ZodEffects<any>>(event: H3Event<EventHandlerRequest>, schema: Z): Promise<Z['_output']> {
    const params = await getValidatedRouterParams(event, (q) => schema.safeParse(q))

    if (!params.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid route parameters',
            message: JSON.stringify(params.error.errors)
        })

    return params.data
}