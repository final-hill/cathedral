import { dedent } from '../../utils/dedent.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { Requirement } from './Requirement.js'

export const Goal = Requirement.extend({
    reqType: z.enum(ReqType).prefault(ReqType.GOAL)
}).describe(dedent(`
    A Goal represents a result desired by an organization; an objective of the project or system in terms of desired effect on the environment.
    
    Content should:
    - Name: State the desired outcome or organizational objective
    - Description: Explain why this goal matters and its expected impact
    - Focus: On business value, user benefits, or organizational improvements
    - Measurable: Include success criteria when possible
    
    Examples: "Reduce customer support response time to under 2 hours", "Increase user engagement by 25%"
`))

export type GoalType = z.infer<typeof Goal>
