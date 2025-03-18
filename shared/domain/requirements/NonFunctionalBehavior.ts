import { z } from "zod";
import { Functionality } from "./Functionality.js";
import { dedent } from "../../../shared/utils/dedent.js";
import { ReqType } from "./ReqType.js";

export const NonFunctionalBehavior = Functionality.extend({
    reqId: z.string().regex(/^S\.2\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.2.').default('S.2.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.NON_FUNCTIONAL_BEHAVIOR)
}).describe(dedent(`
    NonFunctionalBehavior is a type of Behavior that is not directly related to the functionality of a system.
    It specifies **how** the system should behave, i.e., the qualities that the system must exhibit.
    Generally expressed in the form "system shall be <requirement>."
`));