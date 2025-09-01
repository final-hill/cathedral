import { z } from 'zod'
import { InterfaceArtifact } from './InterfaceArtifact.js'
import { ReqType } from './ReqType.js'
import { InterfaceDataTypeKind } from './InterfaceDataTypeKind.js'

export const InterfaceDataType = InterfaceArtifact.extend({
    typeName: z.string().describe('Name of the data type'),
    kind: z.nativeEnum(InterfaceDataTypeKind).describe('Category of data type (Primitive, Product, Sum, Collection)'),
    schema: z.string().optional().describe('Schema definition (JSON Schema, TypeScript interface, etc.)'),
    constraints: z.string().optional().describe('Type constraints and validation rules'),
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE_DATA_TYPE)
}).describe('An InterfaceDataType represents a structured data schema used in interface operations.')

export type InterfaceDataTypeType = z.infer<typeof InterfaceDataType>
