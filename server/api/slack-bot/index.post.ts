import { z } from "zod"
import crypto from 'crypto'
import { WebClient } from "@slack/web-api"

const bodySchema = z.object({
    type: z.string(),
    challenge: z.string().optional(),
    // https://api.slack.com/events
    event: z.object({
        type: z.string(),
        user: z.string(),
        text: z.string(),
        ts: z.string(),
        channel: z.string(),
        event_ts: z.string(),
    }).optional()
})

const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

async function sendResponse(slackEvent: NonNullable<typeof bodySchema._type.event>) {
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

function isValidSlackRequest(headers: Headers, body: typeof bodySchema._type) {
    const signingSecret = process.env.SLACK_SIGNING_SECRET!,
        timestamp = headers.get('X-Slack-Request-Timestamp')!,
        slackSignature = headers.get('X-Slack-Signature')!,
        base = `v0:${timestamp}:${JSON.stringify(body)}`,
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
        headers = event.headers

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const requestType = body.data.type

    if (requestType === 'url_verification')
        return { challenge: body.data.challenge };

    if (!isValidSlackRequest(headers, body.data))
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: 'Invalid Slack request signature'
        })

    if (requestType === 'event_callback') {
        const eventType = body.data.event!.type
        if (eventType === 'app_mention') {
            await sendResponse(body.data.event!)

            return {}
        }
    }

    return {}
})