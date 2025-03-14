import { z } from "zod";
import { Actor } from "./Actor.js";
import { dedent } from "~/shared/utils/dedent.js";
import { ReqType } from "./ReqType.js";

export const Person = Actor.extend({
    email: z.string().email().max(254).optional()
        .describe('The email address of the person'),
    reqId: z.string().regex(/^P\.1\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqType: z.nativeEnum(ReqType).default(ReqType.PERSON)
}).describe(dedent(`
    A member of the Project staff with associated contact information, roles, and responsibilities.
`));