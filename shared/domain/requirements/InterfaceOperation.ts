import { z } from 'zod'
import { InterfaceArtifact } from './InterfaceArtifact.js'
import { ReqType } from './ReqType.js'

export const InterfaceOperation = InterfaceArtifact.extend({
    operationId: z.string().describe('Unique identifier for the operation within the interface'),
    verb: z.string().optional().describe('HTTP verb for APIs, command verb for CLIs, action type for UIs'),
    path: z.string().optional().describe('URL path for APIs, command path for CLIs, screen/component path for UIs'),
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE_OPERATION)
}).describe('An InterfaceOperation represents a specific endpoint, command, or screen within an interface.')

export type InterfaceOperationType = z.infer<typeof InterfaceOperation>
