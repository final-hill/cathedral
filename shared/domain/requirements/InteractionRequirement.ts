import { z } from 'zod'
import { Requirement } from './Requirement.js'
import { ReqType } from './ReqType.js'

export const InteractionRequirement = Requirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERACTION_REQUIREMENT)
}).describe('An InteractionRequirement specifies system behavior by describing interactions between actors and the system or external events that affect the system.')

export type InteractionRequirementType = z.infer<typeof InteractionRequirement>
