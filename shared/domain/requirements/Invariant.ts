import { z } from "zod";
import { Requirement } from "./Requirement.js";
import { dedent } from "../../../shared/utils/dedent.js";
import { ReqType } from "./ReqType.js";

export const Invariant = Requirement.extend({
    reqId: z.string().regex(/^E\.6\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('E.6.').default('E.6.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.INVARIANT)
}).describe(dedent(`
    An Invariant is an Environment property that must be maintained.
    It constrain the possible states of a System.
    It exists as both an assumption and an effect.
    (precondition and postcondition)
`));