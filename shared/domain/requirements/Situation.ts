import { z } from "zod";
import { Goal } from "./Goal.js";
import { ReqType } from "./ReqType.js";

export const Situation = Goal.extend({
    name: z.literal('Situation').default('Situation')
        .describe('The name'),
    reqId: z.literal('G.2.0').default('G.2.0').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SITUATION)
}).describe('The current state of affairs that need to be addressed by the system created by a project.');
