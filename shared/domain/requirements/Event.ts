import { z } from 'zod'
import { Interaction } from './Interaction.js'
import { ReqType } from './ReqType.js'
import { ActorReference, InterfaceReference } from './EntityReferences.js'

export const Event = Interaction.extend({
    reqId: z.string().regex(/^S\.3\.\d+$/, 'Format must be S.3.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.3.').default('S.3.'),
    initiator: ActorReference.optional().describe('The Actor (Person or Component) that initiates this event'),
    interface: InterfaceReference.optional().describe('The Interface that this event is associated with'),
    operationId: z.string().optional().describe('Specific operation within the interface that triggers this event'),
    payloadSchema: z.string().optional().describe('Schema definition for event payload data'),
    reqType: z.nativeEnum(ReqType).default(ReqType.EVENT)
}).describe('An Event is an action upon the system that can trigger use cases or other system behavior.')

export type EventType = z.infer<typeof Event>
