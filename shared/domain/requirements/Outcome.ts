import { z } from 'zod'
import { Goal } from './Goal.js'
import { dedent } from '../../../shared/utils/dedent.js'
import { ReqType } from './ReqType.js'

export const Outcome = Goal.extend({
    reqId: z.string().regex(/^G\.3\.\d+$/, 'Format must be G.3.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.3.').default('G.3.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.OUTCOME)
}).describe(dedent(`
    An Outcome is the expected benefit, capability, or process
    of the system that will be achieved by the associated project.
    It's the high-level goal that the project is trying to achieve.
`))
