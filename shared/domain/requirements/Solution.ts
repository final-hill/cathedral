import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { MetaRequirement } from './MetaRequirement.js'
import { Organization } from './Organization.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Solution = MetaRequirement.extend({
    name: z.string().max(100).nonempty().describe('The name'),
    slug: z.string().nonempty().readonly().describe('A slugified version of the name'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SOLUTION),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.SOLUTION])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    organization: Organization.pick({ reqType: true, id: true, name: true })
        .describe('The organization that the solution belongs to')
}).describe('A Solution is the aggregation of a Project, Environment, Goals, and a System')

export type SolutionType = z.infer<typeof Solution>
