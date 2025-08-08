import { z } from 'zod'
import { MetaRequirement } from './MetaRequirement'
import { ReqType } from './ReqType'
import { dedent } from '~/shared/utils'

export const Goals = MetaRequirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.GOALS)
}).describe(dedent(`
     Goals are the desired outcomes and needs of an
    organization for which a system must satisfy.
`))
