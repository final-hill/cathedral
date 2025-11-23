import { z } from 'zod'
import { Requirement } from './Requirement.js'
import { ReqType } from './ReqType.js'

export const Noise = Requirement.extend({
    reqType: z.enum(ReqType).prefault(ReqType.NOISE)
}).describe('A property that is in requirements but should not be')

export type NoiseType = z.infer<typeof Noise>
