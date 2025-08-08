import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { Requirement } from './Requirement.js'

export const Actor = Requirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.ACTOR)
}).describe('A part of a Project, Environment, System, or Goals that may affect or be affected by the associated entities')

export type ActorType = z.infer<typeof Actor>
