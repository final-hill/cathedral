import { z } from 'zod'
import { Behavior } from './Behavior.js'
import { ReqType } from './ReqType.js'

export const Example = Behavior.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.EXAMPLE)
}).describe('Illustration of behavior through a usage scenario')
