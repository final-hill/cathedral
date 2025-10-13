import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { Prioritizable } from './Prioritizable.js'
import { InterfaceType } from './InterfaceType.js'
import { InterfaceOperationReference } from './EntityReferences.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { Requirement } from './Requirement.js'

export const Interface = Requirement.extend({
    reqId: z.string().regex(/^S\.3\.\d+$/, 'Format must be S.3.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.3.').default('S.3.'),
    // TODO: Interface will probably need subtyping to get this path more specific and to elimicate the interfaceType
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.INTERFACE])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    interfaceType: z.nativeEnum(InterfaceType).describe('Type of interface (API, CLI, or UI)'),
    operations: z.array(InterfaceOperationReference).default([])
        .describe('Interface Operations managed through standard workflow'),
    ...Prioritizable.shape,
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE)
}).describe('An Interface defines how the system exposes its functionality to external actors through APIs, CLIs, or UIs.')

export type InterfaceEntityType = z.infer<typeof Interface>
