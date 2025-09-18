import { BehaviorBase } from './BehaviorBase.js'
import { Prioritizable } from './Prioritizable.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Behavior = BehaviorBase.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.BEHAVIOR),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.BEHAVIOR]),
    ...Prioritizable.shape
}).describe('Property of the operation of the system (System book category 1.6)')

export type BehaviorType = z.infer<typeof Behavior>
