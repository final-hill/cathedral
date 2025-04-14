import { slugify } from "../../../shared/utils/slugify.js";
import { z } from "zod";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

export const Organization = Requirement.extend({
    slug: z.string().nonempty().refine(
        value => value === slugify(value),
        'The slug must be a slugified string'
    ).readonly().describe('A slugified version of the name'),
    reqType: z.nativeEnum(ReqType).default(ReqType.ORGANIZATION),
    solutions: z.array(z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.SOLUTION),
        id: z.string().uuid()
            .describe('The id of the solution'),
        name: z.string()
            .describe('The name of the solution'),
        slug: z.string().nonempty().refine(
            value => value === slugify(value),
            'The slug must be a slugified string'
        ).readonly().describe('A slugified version of the name'),
    })).default([])
        .describe('The solutions that are part of the organization'),
}).refine(
    value => value.slug === slugify(value.name),
    'The slug must be the slugified version of the name'
).describe('An Organization is a collection of users and solutions');