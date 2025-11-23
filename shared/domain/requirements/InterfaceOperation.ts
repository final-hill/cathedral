import { z } from 'zod'
import { InterfaceArtifact } from './InterfaceArtifact.js'
import { ReqType } from './ReqType.js'
import { BehaviorReference, InterfaceSchemaReference, ActorReference, InterfaceReference } from './EntityReferences.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const InterfaceOperation = InterfaceArtifact.extend({
    interface: InterfaceReference
        .readonly()
        .describe('Reference to the parent interface that owns this operation'),
    verb: z.string()
        .optional()
        .describe('HTTP Method / Command / Action'),
    path: z.string()
        .optional()
        .describe('URL Path / Command Path / Screen Path'),
    initiator: ActorReference
        .optional()
        .describe('The Actor (Person or Component) that can initiate this operation'),
    behavior: BehaviorReference
        .optional()
        .describe('Primary Behavior'),
    requestSchema: InterfaceSchemaReference
        .optional()
        .describe('Schema defining the request payload structure'),
    responseSchema: InterfaceSchemaReference
        .optional()
        .describe('Schema defining the response payload structure'),
    reqType: z.enum(ReqType).prefault(ReqType.INTERFACE_OPERATION),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.INTERFACE_OPERATION])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe('An InterfaceOperation represents a specific endpoint, command, or screen within an interface that exposes a system behavior.')

export type InterfaceOperationType = z.infer<typeof InterfaceOperation>
