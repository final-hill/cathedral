import { z } from 'zod'
import { MetaRequirement } from './MetaRequirement'
import { ReqType } from './ReqType'
import { uiBasePathTemplates } from './uiBasePathTemplates'

export const Project = MetaRequirement.extend({
    reqType: z.enum(ReqType).prefault(ReqType.PROJECT),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.PROJECT])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    A Project is the set of human processes involved in the planning,
    construction, revision, and operation of a system
`))
