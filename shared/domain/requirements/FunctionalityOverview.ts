import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { dedent } from '../../utils/dedent.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { Functionality } from './Functionality.js'

export const FunctionalityOverview = Functionality.extend({
    reqId: z.string().regex(/^G\.4\.\d+$/, 'Format must be G.4.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.4.').prefault('G.4.'),
    reqType: z.enum(ReqType).prefault(ReqType.FUNCTIONALITY_OVERVIEW),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.FUNCTIONALITY_OVERVIEW])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    Functionality describes at a high-level what behavior a system should exhibit.
    The details are described in the Systems section.
    Generally expressed in the form "The system shall provide <capability>."

    Example: "The system shall provide user authentication and authorization capabilities."
`))

export type FunctionalityOverviewType = z.infer<typeof FunctionalityOverview>
