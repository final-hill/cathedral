import { Requirement } from './Requirement.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'

export const BehaviorBase = Requirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.BEHAVIOR)
}).describe('Property of the operation of the system (System book category 1.6)')

export type BehaviorBaseType = z.infer<typeof BehaviorBase>
