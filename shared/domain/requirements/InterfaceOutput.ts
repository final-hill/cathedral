import { z } from 'zod'
import { InterfaceArtifact } from './InterfaceArtifact.js'
import { ReqType } from './ReqType.js'
import { InterfaceSchemaReference } from './EntityReferences.js'

export const InterfaceOutput = InterfaceArtifact.extend({
    outputName: z.string()
        .min(1, 'Response field name is required')
        .max(100, 'Response field name must be 100 characters or less')
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Response field name must start with a letter and contain only letters, numbers, and underscores')
        .describe('Response Field Name'),
    dataType: InterfaceSchemaReference
        .optional()
        .describe('Reference to InterfaceSchema definition'),
    primitiveType: z.string()
        .optional()
        .describe('Simple type for basic responses (string, number, boolean)'),
    format: z.string()
        .optional()
        .describe('Format Specification'),
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE_OUTPUT)
}).describe('An InterfaceOutput represents a response field, return value, or output artifact produced by an interface operation.')

export type InterfaceOutputType = z.infer<typeof InterfaceOutput>
