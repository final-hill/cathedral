import { z } from "zod";
import { Behavior } from "./Behavior.js";
import { ReqType } from "./ReqType.js";

export const Functionality = Behavior.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.FUNCTIONALITY)
}).describe('Functionality describes what system will do and how it will do it.');