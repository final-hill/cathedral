import { z } from 'zod'
import { MetaRequirement } from './MetaRequirement'
import { ReqType } from './ReqType'

export const System = MetaRequirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.SYSTEM)
}).describe(dedent(`
    The set of related artifacts that work together achieve the desired
    outcomes of the organization.
`))
