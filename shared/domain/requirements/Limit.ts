import { z } from "zod";
import { Requirement } from "./Requirement.js";
import { dedent } from "#shared/utils/dedent.js";
import { ReqType } from "./ReqType.js";

export const Limit = Requirement.extend({
    reqId: z.string().regex(/^G\.6\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqType: z.nativeEnum(ReqType).default(ReqType.LIMIT)
}).describe(dedent(`
    A Limitation is a constraint on functionality. It describes what is out-of-scope and excluded.
    Example: "Providing an interface to the user to change the color of the background is out-of-scope."
`));