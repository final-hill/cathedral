import { z } from 'zod'
import { MetaRequirement } from './MetaRequirement'
import { ReqType } from './ReqType'
import { uiBasePathTemplates } from './uiBasePathTemplates'

export const Environment = MetaRequirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.ENVIRONMENT),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.ENVIRONMENT])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    An environment is the set of entities (people, organizations, regulations, devices and other material
    objects, other systems) external to the project or system but with the potential to affect it or be affected by
    it.
`))
