import { Requirement } from './Requirement.js'
import { ReqType } from './ReqType.js'
import { z } from 'zod'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { dedent } from '../../utils/dedent.js'

export const Milestone = Requirement.extend({
    reqId: z.string().regex(/^P\.3\.\d+$/, 'Format must be P.3.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('P.3.').prefault('P.3.'),
    reqType: z.enum(ReqType).prefault(ReqType.MILESTONE),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.MILESTONE])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    dueDate: z.date().optional()
        .describe('The expected completion date for this milestone')
}).describe(dedent(`
    A Milestone is a significant point or event in the project timeline marking completion of a phase or deliverable.
    
    Content Guidelines:
    - Name: Should describe the achievement or completion point (e.g., "MVP Release", "Design Phase Complete")
    - Description: Should explain what is completed, delivered, or achieved at this point
    - Should represent measurable progress or concrete deliverables
    - Should NOT be ongoing activities or processes
    - Should have clear completion criteria
`))

export type MilestoneType = z.infer<typeof Milestone>
