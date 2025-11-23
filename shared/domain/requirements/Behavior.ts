import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { Requirement } from './Requirement.js'

export const Behavior = Requirement.extend({
    reqType: z.enum(ReqType).prefault(ReqType.BEHAVIOR),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.BEHAVIOR])
}).describe('Property of the operation of the system')

export type BehaviorType = z.infer<typeof Behavior>
