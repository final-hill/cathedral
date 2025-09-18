import { z } from 'zod'
import { Behavior } from './Behavior.js'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { Functionality } from './Functionality.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const FunctionalBehavior = Behavior.extend({
    reqId: z.string().regex(/^S\.2\.1\.\d+$/, 'Format must be S.2.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.2.1.').default('S.2.1.'),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.FUNCTIONAL_BEHAVIOR])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    reqType: z.nativeEnum(ReqType).default(ReqType.FUNCTIONAL_BEHAVIOR),
    functionality: Functionality.pick({ reqType: true, id: true, name: true })
        .optional().describe('The related high-level functionality (G.4.#) that this behavior implements')
}).describe(dedent(`
    A Functional Behavior specifies WHAT behavior the system should exhibit, i.e.,
    the results or effects of the system's operation.
    Generally expressed in the form "The system must do <requirement>."

    Example: "The system must validate user credentials against the authentication database."
`))

export type FunctionalBehaviorType = z.infer<typeof FunctionalBehavior>
