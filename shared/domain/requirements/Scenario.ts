import { z } from 'zod'
import { Requirement } from './Requirement.js'
import { MoscowPriority } from './MoscowPriority.js'
import { ReqType } from './ReqType.js'

export const Scenario = Requirement.extend({
    primaryActor: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.STAKEHOLDER),
        id: z.string().uuid()
            .describe('Primary actor involved in the scenario'),
        name: z.string()
            .describe('The name of the primary actor involved in the scenario')
    }).describe('Primary actor involved in the scenario'),
    outcome: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.OUTCOME),
        id: z.string().uuid()
            .describe('The outcome (goal) that the scenario is aiming to achieve'),
        name: z.string()
            .describe('The name of the outcome (goal) that the scenario is aiming to achieve')
    }).describe('The outcome (goal) that the scenario is aiming to achieve'),
    priority: z.nativeEnum(MoscowPriority).optional().describe('The Moscow Priority of the scenario'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SCENARIO)
}).describe('A Scenario specifies system behavior by describing paths of interaction between actors and the system. Supertype for use cases, user stories, epics, and test cases.')

export type ScenarioType = z.infer<typeof Scenario>
