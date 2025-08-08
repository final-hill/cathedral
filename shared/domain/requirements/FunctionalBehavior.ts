import { z } from 'zod'
import { Functionality } from './Functionality.js'
import { dedent } from '../../../shared/utils/dedent.js'
import { ReqType } from './ReqType.js'

export const FunctionalBehavior = Functionality.extend({
    reqId: z.string().regex(/^S\.2\.1\.\d+$/, 'Format must be S.2.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.2.1.').default('S.2.1.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.FUNCTIONAL_BEHAVIOR)
}).describe(dedent(`
    A Functional Behavior specifies WHAT behavior the system should exhibit, i.e.,
    the results or effects of the system's operation.
    Generally expressed in the form "system must do <requirement>"
`))

export type FunctionalBehaviorType = z.infer<typeof FunctionalBehavior>
