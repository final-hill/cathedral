import { slugify } from '../../../shared/utils/slugify.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { MetaRequirement } from './MetaRequirement.js'

export const Solution = MetaRequirement.extend({
    name: z.string().max(100).nonempty()
        .refine(
            value => !['new-solution', 'edit-entry', 'users'].includes(slugify(value)),
            'The name cannot slugify as "new-solution", "edit-entry", or "users" as these are reserved'
        ).describe('The name'),
    slug: z.string().nonempty()
        .refine(
            value => value === slugify(value),
            'The slug must be a slugified string'
        ).readonly().describe('A slugified version of the name'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SOLUTION),
    organization: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.ORGANIZATION),
        id: z.string().uuid()
            .describe('The id of the organization'),
        name: z.string()
            .describe('The name of the organization')
    }).describe('The organization that the solution belongs to')
}).refine(
    value => value.slug === slugify(value.name),
    'The slug must be the slugified version of the name'
).describe('A Solution is the aggregation of a Project, Environment, Goals, and a System')

export type SolutionType = z.infer<typeof Solution>
