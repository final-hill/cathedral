import { slugify } from '../../../shared/utils/slugify.js';
import { z } from 'zod';
import { Requirement } from './Requirement.js';
import { ReqType } from "./ReqType.js";

export const Solution = Requirement.extend({
    name: z.string().max(100).nonempty()
        .refine(
            value => !["new-solution", "edit-entry", "users"].includes(slugify(value)),
            'The name cannot slugify as "new-solution", "edit-entry", or "users" as these are reserved'
        ).describe('The name'),
    slug: z.string().nonempty()
        .refine(
            value => value === slugify(value),
            'The slug must be a slugified string'
        ).readonly().describe('A slugified version of the name'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SOLUTION)
}).refine(
    value => value.slug === slugify(value.name),
    'The slug must be the slugified version of the name'
).describe('A Solution is the aggregation of a Project, Environment, Goals, and a System');