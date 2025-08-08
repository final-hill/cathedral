import { Responsibility } from './Responsibility.js'
import { ReqType } from './ReqType.js'
import { z } from 'zod'

export const Role = Responsibility.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.ROLE)
}).describe('A role is a responsibility that is assigned to a human being')

export type RoleType = z.infer<typeof Role>
