import { dedent } from '../../utils/dedent.js'
import { z } from 'zod'
import { MetaRequirement } from './MetaRequirement.js'
import { ReqType } from './ReqType.js'

export const Justification = MetaRequirement.extend({
    reqType: z.enum(ReqType).prefault(ReqType.JUSTIFICATION)
}).describe(dedent(`
    Explanation of a project or system property in reference to a goal or environment property
    A requirement is justified if it helps to achieve a goal or to satisfy an environment property (constraint)
`))

export type JustificationType = z.infer<typeof Justification>
