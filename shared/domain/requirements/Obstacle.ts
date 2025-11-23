import { z } from 'zod'
import { Goal } from './Goal.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { dedent } from '../../utils/dedent.js'

export const Obstacle = Goal.extend({
    reqId: z.string().regex(/^G\.2\.\d+$/, 'Format must be G.2.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.2.').prefault('G.2.'),
    reqType: z.enum(ReqType).prefault(ReqType.OBSTACLE),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.OBSTACLE])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    Obstacles are the challenges, risks, or barriers that prevent goals from being achieved.
    
    Content Guidelines:
    - Name: Should describe the challenge or barrier (e.g., "Budget Constraints", "Legacy System Integration")
    - Description: Should explain what prevents goal achievement and why it's a problem
    - Should identify impediments, risks, or difficulties
    - Should be specific and actionable (so mitigation strategies can be developed)
    - Should focus on real challenges, not hypothetical concerns
`))

export type ObstacleType = z.infer<typeof Obstacle>
