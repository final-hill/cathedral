import { Requirement } from './Requirement.js'
import { ConstraintCategory } from './ConstraintCategory.js'
import { z } from 'zod'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Constraint = Requirement.extend({
    category: z.nativeEnum(ConstraintCategory)
        .describe('Category of the constraint'),
    reqId: z.string().regex(/^E\.3\.\d+$/, 'Format must be E.3.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('E.3.').default('E.3.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.CONSTRAINT),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.CONSTRAINT])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    Constraints are the limitations and obligations that the environment imposes on the project and system.
    
    Content Guidelines:
    - Name: Should clearly indicate a limitation or restriction (e.g., "Maximum Response Time", "Budget Limit")
    - Description: Should use restrictive language (must not, shall not, cannot, limited to, maximum, minimum)
    - Should clearly state what is prohibited, limited, or constrained
    - Should NOT describe desired functionality or behaviors (use Functional/Non-Functional Behavior instead)
    - Should be externally imposed by environment, regulations, or business rules
`))

export type ConstraintType = z.infer<typeof Constraint>
