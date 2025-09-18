import { z } from 'zod'
import { MetaRequirement } from './MetaRequirement'
import { ReqType } from './ReqType'
import { uiBasePathTemplates } from './uiBasePathTemplates'

export const System = MetaRequirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.SYSTEM),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.SYSTEM])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    The set of related artifacts that work together achieve the desired
    outcomes of the organization.
`))
