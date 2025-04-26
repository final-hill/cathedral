import { slugify } from "../../../shared/utils/slugify.js";
import { z } from "zod";
import { MetaRequirement } from "./MetaRequirement.js";
import { ReqType } from "./ReqType.js";

export const Organization = MetaRequirement.extend({
    slug: z.string().nonempty().refine(
        value => value === slugify(value),
        'The slug must be a slugified string'
    ).readonly().describe('A slugified version of the name'),
    reqType: z.nativeEnum(ReqType).default(ReqType.ORGANIZATION)
}).refine(
    value => value.slug === slugify(value.name),
    'The slug must be the slugified version of the name'
).describe('An Organization is a collection of users and solutions');