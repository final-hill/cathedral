import { z } from 'zod'
import { InterfaceArtifact } from './InterfaceArtifact.js'
import { ReqType } from './ReqType.js'

export const InterfaceInput = InterfaceArtifact.extend({
    inputName: z.string().describe('Name of the input parameter, option, or field'),
    required: z.boolean().default(false).describe('Whether this input is required'),
    dataType: z.string().optional().describe('Data type of the input (string, number, boolean, etc.)'),
    constraints: z.string().optional().describe('Validation constraints or rules for the input'),
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE_INPUT)
}).describe('An InterfaceInput represents a parameter, option, or field that can be provided to an interface operation.')

export type InterfaceInputType = z.infer<typeof InterfaceInput>
