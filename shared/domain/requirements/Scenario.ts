import { z } from 'zod'
import { Requirement } from './Requirement.js'
import { MoscowPriority } from './MoscowPriority.js'
import { ReqType } from './ReqType.js'
import { StakeholderReference, OutcomeReference, FunctionalBehaviorReference } from './EntityReferences.js'

export const Scenario = Requirement.extend({
    primaryActor: StakeholderReference
        .describe('Primary actor involved in the scenario'),
    outcome: OutcomeReference
        .describe('The outcome (goal) that the scenario is aiming to achieve'),
    functionalBehavior: FunctionalBehaviorReference
        .describe('The functional behavior that this scenario implements'),
    priority: z.nativeEnum(MoscowPriority).optional().describe('The Moscow Priority of the scenario'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SCENARIO)
}).describe('A Scenario specifies system behavior by describing paths of interaction between actors and the system. Supertype for use cases, user stories, epics, and test cases.')

export type ScenarioType = z.infer<typeof Scenario>
