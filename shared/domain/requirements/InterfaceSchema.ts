import { z } from 'zod'
import { InterfaceArtifact } from './InterfaceArtifact.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const InterfaceSchema = InterfaceArtifact.extend({
    schema: z.object({}).passthrough().describe('The JSON schema definition object'),
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE_SCHEMA),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.INTERFACE_SCHEMA])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe('Interface Schema describes the structure of the objects passed to or returned from an Interface')

export type InterfaceSchemaType = z.infer<typeof InterfaceSchema>
