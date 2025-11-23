import { z } from 'zod'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { Functionality } from './Functionality.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { Prioritizable } from './Prioritizable.js'
import { FunctionalityOverviewReference } from './EntityReferences.js'

export const FunctionalBehavior = Functionality.extend({
    ...Prioritizable.shape,
    reqId: z.string().regex(/^S\.2\.1\.\d+$/, 'Format must be S.2.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.2.1.').prefault('S.2.1.'),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.FUNCTIONAL_BEHAVIOR])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    reqType: z.enum(ReqType).prefault(ReqType.FUNCTIONAL_BEHAVIOR),
    goalFunctionality: FunctionalityOverviewReference
        .optional().describe('The related high-level functionality (G.4.#) that this behavior implements')
}).describe(dedent(`
    A Functional Behavior specifies WHAT behavior the system should exhibit, i.e.,
    the results or effects of the system's operation.
    Generally expressed in the form "The system must do <requirement>."

    Content Guidelines:
    - Name: Should describe a system capability using clear action verbs (e.g., "Validate Credentials", "Send Email Notification")
    - Description: Should explain WHAT the system does, not HOW it does it
    - Should use active voice and present tense ("validates", "sends", "processes")
    - Should be focused on a single, specific behavior
    - Should be testable and verifiable
    - Should NOT include quality attributes (use Non-Functional Behavior) or UI details (use Use Case)
    
    Example: "The system must validate user credentials against the authentication database."
`))

export type FunctionalBehaviorType = z.infer<typeof FunctionalBehavior>
