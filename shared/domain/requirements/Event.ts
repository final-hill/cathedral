import { z } from 'zod'
import { InteractionRequirement } from './InteractionRequirement.js'
import { ReqType } from './ReqType.js'

export const Event = InteractionRequirement.extend({
    reqId: z.string().regex(/^S\.3\.\d+$/, 'Format must be S.3.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.3.').default('S.3.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.EVENT)
}).describe('An Event is an action upon the system that can trigger use cases or other system behavior.')

export type EventType = z.infer<typeof Event>
