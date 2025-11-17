import { dedent } from '../../utils/dedent.js'
import { Requirement } from './Requirement.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Assumption = Requirement.extend({
    reqId: z.string().regex(/^E\.4\.\d+$/, 'Format must be E.4.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('E.4.').default('E.4.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.ASSUMPTION),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.ASSUMPTION])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    An Assumption is a property of the environment that is assumed to be true; a precondition.
    
    Content Guidelines:
    - Name: Should indicate what is being assumed (e.g., "Network Availability", "User Has Internet Access")
    - Description: Should state what is being assumed and why it's reasonable to assume it
    - Should be external to the system (environment properties, user capabilities, infrastructure)
    - Should NOT contain requirements or constraints about the system itself
    - Should be verifiable conditions that can be checked
    
    Example: "Screen resolution will not change during the execution of the program"
`))

export type AssumptionType = z.infer<typeof Assumption>
