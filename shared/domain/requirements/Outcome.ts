import { z } from "zod";
import { Goal } from "./Goal.js";
import { dedent } from "#shared/utils/dedent.js";
import { ReqType } from "./ReqType.js";

export const Outcome = Goal.extend({
    // FIXME: The Context and overall objective entry is an Outcome, but the req_id is G.1.0
    reqId: z.string().regex(/^G\.3\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqType: z.nativeEnum(ReqType).default(ReqType.OUTCOME)
}).describe(dedent(`
    An Outcome is the expected benefit, capability, or process
    of the system that will be achieved by the associated project.
    It's the high-level goal that the project is trying to achieve.
`));