import { z } from 'zod'
import { Behavior } from './Behavior.js'
import { ReqType } from './ReqType.js'

export const Functionality = Behavior.extend({
    reqId: z.string().regex(/^G\.4\.\d+$/, 'Format must be G.4.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.4.').default('G.4.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.FUNCTIONALITY)
}).describe('Functionality describes at a high-level what behavior a system should exhibit. The details are described in the Systems section')

export type FunctionalityType = z.infer<typeof Functionality>
