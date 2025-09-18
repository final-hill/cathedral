import { slugify } from '../../utils/slugify.js'
import { z } from 'zod'
import { MetaRequirement } from './MetaRequirement.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Organization = MetaRequirement.extend({
    slug: z.string().nonempty().refine(
        value => value === slugify(value),
        'The slug must be a slugified string'
    ).readonly().describe('A slugified version of the name'),
    reqType: z.nativeEnum(ReqType).default(ReqType.ORGANIZATION),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.ORGANIZATION])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).refine(
    value => value.slug === slugify(value.name),
    'The slug must be the slugified version of the name'
).describe('An Organization is a collection of users and solutions')

export type OrganizationType = z.infer<typeof Organization>
