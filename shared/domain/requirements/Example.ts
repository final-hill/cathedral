import { z } from 'zod'
import { BehaviorBase } from './BehaviorBase.js'
import { ReqType } from './ReqType.js'

export const Example = BehaviorBase.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.EXAMPLE)
}).describe('Illustration of behavior through a usage scenario')

export type ExampleType = z.infer<typeof Example>
