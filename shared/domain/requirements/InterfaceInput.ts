import { z } from 'zod'
import { InterfaceArtifact } from './InterfaceArtifact.js'
import { ReqType } from './ReqType.js'
import { InterfaceSchemaReference } from './EntityReferences.js'

export const InterfaceInput = InterfaceArtifact.extend({
    inputName: z.string()
        .min(1, 'Parameter name is required')
        .max(100, 'Parameter name must be 100 characters or less')
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Parameter name must start with a letter and contain only letters, numbers, and underscores')
        .describe('Parameter Name'),
    required: z.boolean()
        .default(false)
        .describe('Required'),
    dataType: InterfaceSchemaReference
        .optional()
        .describe('Reference to InterfaceSchema definition'),
    primitiveType: z.string()
        .optional()
        .describe('Simple type for basic parameters (string, number, boolean)'),
    constraints: z.string()
        .optional()
        .describe('Validation Constraints'),
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE_INPUT)
}).describe('An InterfaceInput represents a parameter, option, or field that can be provided to an interface operation.')

export type InterfaceInputType = z.infer<typeof InterfaceInput>
