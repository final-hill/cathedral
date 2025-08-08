import { Requirement } from './Requirement.js'
import { ReqType } from './ReqType.js'
import { z } from 'zod'

export const Product = Requirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.PRODUCT)
}).describe('Artifact needed or produced by a task')

export type ProductType = z.infer<typeof Product>
