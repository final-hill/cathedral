import { dedent } from "../../../shared/utils/dedent.js";
import { Requirement } from "./Requirement.js";
import { z } from "zod";
import { ReqType } from "./ReqType.js";

export const Assumption = Requirement.extend({
    reqId: z.string().regex(/^E\.4\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqType: z.nativeEnum(ReqType).default(ReqType.ASSUMPTION)
}).describe(dedent(`
    An assumption is a property of the environment that is assumed to be true; a precondition.
    An example of an assumption would be: "Screen resolution will not change during the execution of the program".
`))