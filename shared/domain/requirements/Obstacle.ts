import { z } from 'zod'
import { Goal } from './Goal.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Obstacle = Goal.extend({
    reqId: z.string().regex(/^G\.2\.\d+$/, 'Format must be G.2.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.2.').default('G.2.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.OBSTACLE),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.OBSTACLE])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe('Obstacles are the challenges that prevent the goals from being achieved.')

export type ObstacleType = z.infer<typeof Obstacle>
