import { Responsibility } from './Responsibility.js'
import { ReqType } from './ReqType.js'
import { PersonReference } from './EntityReferences.js'
import { z } from 'zod'

export const Role = Responsibility.extend({
    persons: z.array(PersonReference).optional()
        .describe('The persons assigned to this role within the project'),
    reqType: z.nativeEnum(ReqType).default(ReqType.ROLE)
}).describe('A role is a responsibility that is assigned to a human being')

export type RoleType = z.infer<typeof Role>
