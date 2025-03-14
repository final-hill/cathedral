import { z } from "zod";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

export const Noise = Requirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.NOISE)
}).describe('A property that is in requirements but should not be');