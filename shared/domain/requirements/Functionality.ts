import { z } from 'zod'
import { Goal } from './Goal.js'
import { ReqType } from './ReqType.js'
import { dedent } from '../../utils/dedent.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Functionality = Goal.extend({
    reqId: z.string().regex(/^G\.4\.\d+$/, 'Format must be G.4.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.4.').default('G.4.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.FUNCTIONALITY),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.FUNCTIONALITY])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    Functionality describes at a high-level what behavior a system should exhibit.
    The details are described in the Systems section.
    Generally expressed in the form "The system shall provide <capability>."

    Example: "The system shall provide user authentication and authorization capabilities."
`))

export type FunctionalityType = z.infer<typeof Functionality>
