import { z } from "zod";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Property that is not in requirements but should be
 */
export const Silence = Requirement.extend({
    isSilence: z.literal(true)
        .describe('A flag to indicate if the requirement is silence'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SILENCE)
})