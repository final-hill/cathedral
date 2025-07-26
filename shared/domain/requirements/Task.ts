import { Requirement } from './Requirement.js'
import { ReqType } from './ReqType.js'
import { z } from 'zod'

export const Task = Requirement.extend({
    reqType: z.enum(ReqType).default(ReqType.TASK)
}).describe('Activity included in the project')
