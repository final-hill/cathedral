import { z } from "zod";
import { Obstacle } from "./Obstacle.js";
import { ReqType } from "./ReqType.js";

export const Situation = Obstacle.extend({
    name: z.literal('Situation').default('Situation')
        .describe('The name'),
    reqId: z.literal('G.2.0').default('G.2.0'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SITUATION)
}).describe('The current state of affairs that need to be addressed by the system created by a project.');
