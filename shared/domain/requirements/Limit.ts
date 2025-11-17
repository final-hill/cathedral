import { z } from 'zod'
import { Requirement } from './Requirement.js'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Limit = Requirement.extend({
    reqId: z.string().regex(/^G\.6\.\d+$/, 'Format must be G.6.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.6.').default('G.6.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.LIMIT),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.LIMIT])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    A Limit is a constraint on functionality that explicitly describes what is out-of-scope and excluded from the project.
    
    Content Guidelines:
    - Name: Should clearly indicate what is being excluded (e.g., "No Mobile Support", "Background Color Customization")
    - Description: Should explicitly state what is NOT included using language like "out-of-scope", "excluded", "not supported"
    - Should help clarify project boundaries and prevent scope creep
    - Should NOT describe what the system WILL do (use Functional Behavior instead)
    
    Example: "Providing an interface to the user to change the color of the background is out-of-scope."
`))

export type LimitType = z.infer<typeof Limit>
