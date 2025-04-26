import { dedent } from "../../../shared/utils/dedent.js";
import { Requirement } from "./Requirement.js";
import { z } from "zod";
import { ReqType } from "./ReqType.js";

export const Assumption = Requirement.extend({
    reqId: z.string().regex(/^E\.4\.\d+$/, 'Format must be E.4.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('E.4.').default('E.4.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.ASSUMPTION)
}).describe(dedent(`
    An assumption is a property of the environment that is assumed to be true; a precondition.
    An example of an assumption would be: "Screen resolution will not change during the execution of the program".
`))