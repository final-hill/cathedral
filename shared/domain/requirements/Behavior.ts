import { Requirement } from './Requirement.js'
import { MoscowPriority } from './MoscowPriority.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'

export const Behavior = Requirement.extend({
    priority: z.enum(MoscowPriority).describe('The Moscow Priority of the behavior'),
    reqType: z.enum(ReqType).default(ReqType.BEHAVIOR)
}).describe('A Behavior is a property of the operation of the system')
