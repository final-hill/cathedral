import { z } from 'zod'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { Functionality } from './Functionality.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { Prioritizable } from './Prioritizable.js'
import { FunctionalityOverviewReference } from './EntityReferences.js'

export const NonFunctionalBehavior = Functionality.extend({
    ...Prioritizable.shape,
    reqId: z.string().regex(/^S\.2\.2\.\d+$/, 'Format must be S.2.2.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.2.2.').default('S.2.2.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.NON_FUNCTIONAL_BEHAVIOR),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.NON_FUNCTIONAL_BEHAVIOR])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    goalFunctionality: FunctionalityOverviewReference
        .optional().describe('The related high-level functionality (G.4.#) that this behavior implements')
}).describe(dedent(`
    NonFunctionalBehavior is a type of Behavior that is not directly related to the functionality of a system.
    It specifies **how** the system should behave, i.e., the qualities that the system must exhibit.
    Generally expressed in the form "system shall be <requirement>."
`))

export type NonFunctionalBehaviorType = z.infer<typeof NonFunctionalBehavior>
