import { BehaviorBase } from './BehaviorBase.js'
import { MoscowPriority } from './MoscowPriority.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'

export const Behavior = BehaviorBase.extend({
    priority: z.nativeEnum(MoscowPriority).optional().describe('The Moscow Priority of the behavior'),
    reqType: z.nativeEnum(ReqType).default(ReqType.BEHAVIOR)
}).describe('Property of the operation of the system (System book category 1.6)')

export type BehaviorType = z.infer<typeof Behavior>
