import { z } from 'zod'
import { MetaRequirement } from './MetaRequirement.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Organization = MetaRequirement.extend({
    slug: z.string().nonempty().readonly().describe('A slugified version of the name'),
    reqType: z.nativeEnum(ReqType).default(ReqType.ORGANIZATION),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.ORGANIZATION])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe('An Organization is a collection of users and solutions')

export type OrganizationType = z.infer<typeof Organization>
