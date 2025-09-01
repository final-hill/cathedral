import { z } from 'zod'
import { Interaction } from './Interaction.js'
import { ReqType } from './ReqType.js'
import { Prioritizable } from './Prioritizable.js'
import { InterfaceType } from './InterfaceType.js'

export const Interface = Interaction.extend({
    reqId: z.string().regex(/^S\.3\.\d+$/, 'Format must be S.3.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.3.').default('S.3.'),
    interfaceType: z.nativeEnum(InterfaceType).describe('Type of interface (API, CLI, or UI)'),
    ...Prioritizable.shape,
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE)
}).describe('An Interface defines how the system exposes its functionality to external actors through APIs, CLIs, or UIs.')

export type InterfaceSchemaType = z.infer<typeof Interface>
