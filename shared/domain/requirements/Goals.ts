import { z } from 'zod'
import { MetaRequirement } from './MetaRequirement'
import { ReqType } from './ReqType'
import { uiBasePathTemplates } from './uiBasePathTemplates'

export const Goals = MetaRequirement.extend({
    reqType: z.enum(ReqType).prefault(ReqType.GOALS),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.GOALS])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    Goals are the desired outcomes and needs of an
    organization for which a system must satisfy.
`))
