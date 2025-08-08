import { z } from 'zod'
import { MetaRequirement } from './MetaRequirement'
import { ReqType } from './ReqType'
import { dedent } from '~/shared/utils'

export const Project = MetaRequirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.PROJECT)
}).describe(dedent(`
    A Project is the set of human processes involved in the planning,
    construction, revision, and operation of a system
`))
