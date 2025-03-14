import { z } from "zod";
import { Example } from "./Example.js";
import { ReqType } from "./ReqType.js";

export const Scenario = Example.extend({
    primaryActor: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.ACTOR),
        id: z.string().uuid()
            .describe('Primary actor involved in the scenario'),
        name: z.string()
            .describe('The name of the primary actor')
    }).describe('Primary actor involved in the scenario'),
    outcome: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.OUTCOME),
        id: z.string().uuid()
            .describe('The outcome (goal) that the scenario is aiming to achieve'),
        name: z.string()
            .describe('The name of the outcome')
    }).describe('The outcome (goal) that the scenario is aiming to achieve'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SCENARIO)
}).describe('A Scenario specifies system behavior by describing paths of interaction between actors and the system.');