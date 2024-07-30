import { z } from "zod"
import crypto from 'crypto'
import { WebClient } from "@slack/web-api"

// https://api.slack.com/events
const eventSchema = z.object({
    type: z.string(),
    user: z.string(),
    text: z.string(),
    ts: z.string(),
    channel: z.string(),
    event_ts: z.string(),
})

const urlVerificationSchema = z.object({
    token: z.string(),
    challenge: z.string(),
    type: z.literal("url_verification"),
})

const appMentionSchema = z.object({
    type: z.literal("app_mention"),
    user: z.string(),
    text: z.string(),
    ts: z.string(),
    channel: z.string(),
    event_ts: z.string(),
})

const eventCallbackSchema = z.object({
    token: z.string(),
    team_id: z.string(),
    api_app_id: z.string(),
    event: appMentionSchema,
    type: z.literal("event_callback"),
    event_id: z.string(),
    event_time: z.number(),
    authed_users: z.array(z.string()),
})

const bodySchema = z.union([urlVerificationSchema, eventCallbackSchema])

const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

async function sendResponse(slackEvent: NonNullable<typeof eventSchema._type>) {
    const { channel, ts } = slackEvent

    try {
        const thread = await slack.conversations.replies({
            channel,
            ts,
            inclusive: true,
        })

        // const prompts = await generatePromptFromThread(thread)
        // const llmResponse = await getLlmResponse(prompts)

        await slack.chat.postMessage({
            channel,
            text: 'Your message has been received, but I am unable to respond at this time.',
            thread_ts: ts,
        })
    } catch (error) {
        await slack.chat.postMessage({
            channel,
            thread_ts: ts,
            text: `@${process.env.SLACK_ADMIN_MEMBER_ID} ` +
                `There was an error processing the message. ` +
                `Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`
        })
    }
}

// https://api.slack.com/authentication/verifying-requests-from-slack#validating-a-request
function isValidSlackRequest(headers: Headers, rawBody: string) {
    const signingSecret = process.env.SLACK_SIGNING_SECRET!,
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

/**
 * Manages communications from the Slack bot
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        rawBody = (await readRawBody(event))!,
        headers = event.headers

    if (!process.env.SLACK_BOT_TOKEN)
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Slack bot token not found'
        })

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    if (!isValidSlackRequest(headers, rawBody))
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: 'Invalid Slack request signature'
        })

    const requestType = body.data.type

    switch (requestType) {
        case 'url_verification':
            return { challenge: body.data.challenge };
        case 'event_callback':
            const eventType = body.data.event!.type
            if (eventType === 'app_mention')
                return await sendResponse(body.data.event!)

            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request: Invalid event type',
                message: `Unhandled event type: ${eventType}`
            })
        default:
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request: Invalid request type',
                message: `Unhandled request type: ${requestType}`
            })
    }
})