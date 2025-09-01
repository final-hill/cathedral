import { z } from 'zod'
import { InterfaceArtifact } from './InterfaceArtifact.js'
import { ReqType } from './ReqType.js'

export const InterfaceOutput = InterfaceArtifact.extend({
    outputName: z.string().describe('Name of the output response, result, or display'),
    dataType: z.string().optional().describe('Data type of the output (string, number, object, etc.)'),
    format: z.string().optional().describe('Format specification (JSON schema, display format, etc.)'),
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE_OUTPUT)
}).describe('An InterfaceOutput represents a response, result, or display element produced by an interface operation.')

export type InterfaceOutputType = z.infer<typeof InterfaceOutput>
