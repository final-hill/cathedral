import { z } from "zod";
import { Scenario } from "./Scenario.js";
import { dedent } from "../../../shared/utils/dedent.js";
import { ReqType } from "./ReqType.js";

export const Epic = Scenario.extend({
    reqId: z.string().regex(/^G\.5\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    functionalBehavior: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.FUNCTIONAL_BEHAVIOR),
        id: z.string().uuid()
            .describe('The functional behavior of the Epic'),
        name: z.string()
            .describe('The name of the functional behavior')
    }).describe('The functional behavior of the Epic'),
    reqType: z.nativeEnum(ReqType).default(ReqType.EPIC)
}).describe(dedent(`
    An Epic is a collection of Use Cases and User Stories all directed towards a common goal;
    Ex: "decrease the percentage of of fraudulent sellers by 20%"'
`));