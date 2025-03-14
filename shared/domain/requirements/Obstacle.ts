import { z } from "zod";
import { Goal } from "./Goal.js";
import { ReqType } from "./ReqType.js";

export const Obstacle = Goal.extend({
    reqId: z.string().regex(/^G\.2\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqType: z.nativeEnum(ReqType).default(ReqType.OBSTACLE)
}).describe('Obstacles are the challenges that prevent the goals from being achieved.');