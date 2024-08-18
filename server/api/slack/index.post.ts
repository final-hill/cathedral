import { WebClient } from "@slack/web-api"
import crypto from 'crypto'
import { z } from "zod"

// https://api.slack.com/events
const urlVerificationSchema = z.object({
    token: z.string(),
    challenge: z.string(),
    type: z.literal("url_verification")
})

const appMentionSchema = z.object({
    type: z.literal("app_mention"),
    user: z.string(),
    bot_id: z.string().optional(),
    text: z.string(),
    ts: z.string(),
    channel: z.string(),
    event_ts: z.string(),
})

const messageSchema = z.object({
    type: z.literal("message"),
    bot_id: z.string().optional(),
    user: z.string(),
    text: z.string(),
    ts: z.string(),
    channel: z.string(),
    event_ts: z.string()
})

const eventCallbackSchema = z.object({
    token: z.string(),
    team_id: z.string(),
    api_app_id: z.string(),
    event: z.union([appMentionSchema, messageSchema]),
    type: z.literal('event_callback'),
    event_id: z.string(),
    event_time: z.number(),
    authorizations: z.array(z.object({
        enterprise_id: z.string().nullable(),
        team_id: z.string(),
        user_id: z.string(),
        is_bot: z.boolean(),
        is_enterprise_install: z.boolean()
    })),
    is_ext_shared_channel: z.boolean(),
    event_context: z.string()
});

const bodySchema = z.union([urlVerificationSchema, eventCallbackSchema])

const config = useRuntimeConfig(),
    slack = new WebClient(config.slackBotToken)

async function sendResponse(slackEvent: typeof eventCallbackSchema._type.event) {
    try {
        // const thread = await slack.conversations.replies({
        //     channel,
        //     ts,
        //     // inclusive: true,
        // })

        // const prompts = await generatePromptFromThread(thread)
        // const llmResponse = await getLlmResponse(prompts)

        const result = await slack.chat.postMessage({
            channel: slackEvent.channel,
            text: 'Message received. I do not have a response yet.',
            thread_ts: slackEvent.ts,
        })
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Failed to send response to Slack',
            data: { error }
        })
    }
}

// https://api.slack.com/authentication/verifying-requests-from-slack#validating-a-request
function isValidSlackRequest(headers: Headers, rawBody: string) {
    const signingSecret = config.slackSigningSecret,
        timestamp = headers.get('X-Slack-Request-Timestamp')!

    // Prevent replay attacks by checking the timestamp
    // to verify that it does not differ from local time by more than five minutes.
    const curTimestamp = Math.floor(Date.now() / 1000),
        reqTimestamp = parseInt(timestamp, 10);

    if (Math.abs(curTimestamp - reqTimestamp) > 300) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: 'Invalid Slack request timestamp'
        });
    }

    const slackSignature = headers.get('X-Slack-Signature')!,
        base = `v0:${timestamp}:${rawBody}`,
        hmac = crypto
            .createHmac('sha256', signingSecret)
            .update(base)
            .digest('hex'),
        computedSignature = `v0=${hmac}`

    return computedSignature === slackSignature
}

export default defineEventHandler(async (event) => {
    const rawBody = (await readRawBody(event))!

    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        headers = event.headers

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Invalid request body'
        })

    if (!isValidSlackRequest(headers, rawBody))
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: 'Invalid Slack request signature'
        })

    const requestType = body.data?.type

    if (!body.data)
        return {}

    switch (requestType) {
        case 'url_verification':
            return { challenge: body.data.challenge }
        case 'event_callback':
            const eventType = body.data.event.type
            switch (eventType) {
                case 'app_mention':
                case 'message':
                    // prevent infinite loop by ignoring messages from bots
                    // Including messages from our own bot
                    if (body.data.event.bot_id)
                        return {}
                    return await sendResponse(body.data.event)
                default:
                    throw createError({
                        statusCode: 400,
                        statusMessage: 'Bad Request: Invalid event type',
                        message: `Unhandled event type: ${eventType}`
                    })
            }
        default:
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request: Invalid request type',
                message: `Unhandled request type: ${requestType}`
            })
    }
})