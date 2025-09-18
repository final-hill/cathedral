import { z } from 'zod'
import { Requirement } from './Requirement.js'
import { ReqType } from './ReqType.js'

export const Interaction = Requirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERACTION)
}).describe('An Interaction specifies system behavior by describing interactions between actors and the system or external events that affect the system.')

export type InteractionType = z.infer<typeof Interaction>
