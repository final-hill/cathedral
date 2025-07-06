import { z } from 'zod'
import { Noise } from './Noise.js'
import { ReqType } from './ReqType.js'

export const Hint = Noise.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.HINT)
}).describe('Design or implementation suggestion')
