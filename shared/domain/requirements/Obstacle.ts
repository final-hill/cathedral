import { z } from 'zod'
import { Goal } from './Goal.js'
import { ReqType } from './ReqType.js'

export const Obstacle = Goal.extend({
    reqId: z.string().regex(/^G\.2\.\d+$/, 'Format must be G.2.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.2.').default('G.2.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.OBSTACLE)
}).describe('Obstacles are the challenges that prevent the goals from being achieved.')

export type ObstacleType = z.infer<typeof Obstacle>
