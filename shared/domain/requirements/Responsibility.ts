import { Requirement } from './Requirement.js'
import { ReqType } from './ReqType.js'
import { z } from 'zod'

export const Responsibility = Requirement.extend({
    reqType: z.enum(ReqType).default(ReqType.RESPONSIBILITY)
}).describe('Assignment of behavior or task to a component')
