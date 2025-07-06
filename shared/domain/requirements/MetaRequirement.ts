import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { Requirement } from './Requirement.js'

export const MetaRequirement = Requirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.META_REQUIREMENT)
}).describe('A requirement that applies to other requirements')
