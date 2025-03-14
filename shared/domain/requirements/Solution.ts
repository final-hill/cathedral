import { slugify } from '#shared/utils/slugify';
import { z } from 'zod';
import { Requirement } from './Requirement.js';
import { ReqType } from "./ReqType.js";

export const Solution = Requirement.extend({
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