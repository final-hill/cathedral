import { z } from 'zod'

// https://api.slack.com/interactivity/slash-commands#app_command_handling
export const slackSlashCommandSchema = z.object({
    token: z.string(),
    team_id: z.string(),
    team_domain: z.string(),
    channel_id: z.string(),
    channel_name: z.string(),
    user_id: z.string(),
    user_name: z.string(),
    command: z.string(),
    text: z.string(),
    response_url: z.string().url(),
    trigger_id: z.string(),
    api_app_id: z.string().optional(),
    enterprise_id: z.string().optional(),
    enterprise_name: z.string().optional(),
    is_enterprise_install: z.union([z.string(), z.boolean()]).optional()
    // Slack may send additional fields, so allow unknowns
}).passthrough()

export const slackUrlVerificationSchema = z.object({
    token: z.string(),
    challenge: z.string(),
    type: z.literal('url_verification')
})

export const slackAppMentionSchema = z.object({
    type: z.literal('app_mention'),
    user: z.string(),
    bot_id: z.string().optional(),
    text: z.string(),
    ts: z.string(),
    channel: z.string(),
    event_ts: z.string()
})

export const slackMessageSchema = z.object({
    type: z.literal('message'),
    bot_id: z.string().optional(),
    user: z.string(),
    text: z.string(),
    ts: z.string(),
    channel: z.string(),
    channel_type: z.enum(['im', 'mpim', 'channel', 'group']),
    event_ts: z.string()
})

export const slackEventCallbackSchema = z.object({
    token: z.string(),
    team_id: z.string(),
    api_app_id: z.string(),
    event: z.union([
        // These must be imported from this file
        // and referenced in SlackService
        slackAppMentionSchema,
        slackMessageSchema
    ]),
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
})

export const slackBodySchema = z.union([
    slackUrlVerificationSchema,
    slackEventCallbackSchema
])

export const slackInteractivePayloadSchema = z.object({
    type: z.string(),
    user: z.object({ id: z.string() }),
    team: z.object({ id: z.string() }),
    channel: z.object({ id: z.string() }),
    actions: z.array(z.object({
        action_id: z.string(),
        selected_option: z.object({ value: z.string() }).optional()
    })).optional(),
    response_url: z.string().url().optional(),
    trigger_id: z.string().optional()
    // ...other fields as needed
}).passthrough()

export type SlackInteractivePayload = z.infer<typeof slackInteractivePayloadSchema>

// Slack Block Kit element types
export const slackTextObjectSchema = z.object({
    type: z.enum(['plain_text', 'mrkdwn']),
    text: z.string(),
    emoji: z.boolean().optional()
})

export const slackOptionSchema = z.object({
    text: slackTextObjectSchema,
    value: z.string()
})

export const slackSelectElementSchema = z.object({
    type: z.literal('static_select'),
    placeholder: slackTextObjectSchema,
    options: z.array(slackOptionSchema),
    action_id: z.string()
})

export const slackSectionBlockSchema = z.object({
    type: z.literal('section'),
    text: slackTextObjectSchema.optional(),
    accessory: slackSelectElementSchema.optional()
})

export const slackButtonElementSchema = z.object({
    type: z.literal('button'),
    text: slackTextObjectSchema,
    url: z.string().optional(),
    action_id: z.string(),
    style: z.enum(['primary', 'danger']).optional()
})

export const slackActionsBlockSchema = z.object({
    type: z.literal('actions'),
    elements: z.array(slackButtonElementSchema)
})

export const slackBlockSchema = z.union([
    slackSectionBlockSchema,
    slackActionsBlockSchema
])

// Slack response message types
export const slackResponseMessageSchema = z.object({
    response_type: z.enum(['ephemeral', 'in_channel']),
    text: z.string(),
    blocks: z.array(slackBlockSchema).optional(),
    replace_original: z.boolean().optional(),
    delete_original: z.boolean().optional()
})

// Organization and Solution data types for UI creation
export const organizationDataSchema = z.object({
    id: z.string(),
    name: z.string()
})

export const solutionDataSchema = z.object({
    id: z.string(),
    name: z.string()
})

// Type exports
export type SlackTextObject = z.infer<typeof slackTextObjectSchema>
export type SlackOption = z.infer<typeof slackOptionSchema>
export type SlackSelectElement = z.infer<typeof slackSelectElementSchema>
export type SlackSectionBlock = z.infer<typeof slackSectionBlockSchema>
export type SlackButtonElement = z.infer<typeof slackButtonElementSchema>
export type SlackActionsBlock = z.infer<typeof slackActionsBlockSchema>
export type SlackBlock = z.infer<typeof slackBlockSchema>
export type SlackResponseMessage = z.infer<typeof slackResponseMessageSchema>
export type OrganizationData = z.infer<typeof organizationDataSchema>
export type SolutionData = z.infer<typeof solutionDataSchema>
