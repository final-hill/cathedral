import { z } from "zod";
import { Requirement } from "./Requirement.js";
import { dedent } from "../../../shared/utils/dedent.js";
import { ReqType } from "./ReqType.js";

export const Effect = Requirement.extend({
    reqId: z.string().regex(/^E\.5\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqType: z.nativeEnum(ReqType).default(ReqType.EFFECT)
}).describe(dedent(`
    An Effect is a property of the environment affected by the system.
    Example: "The running system will cause the temperature of the room to increase."
`));