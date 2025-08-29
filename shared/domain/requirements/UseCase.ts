import { z } from 'zod'
import { Scenario } from './Scenario.js'
import { ReqType } from './ReqType.js'
import { SystemComponent } from './SystemComponent.js'
import { AssumptionReference, EffectReference, ScenarioStepReference, StakeholderReference, EventReference } from './EntityReferences.js'

export const UseCase = Scenario.extend({
    reqId: z.string().regex(/^S\.4\.2\.\d+$/, 'Format must be S.4.2.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.4.2.').default('S.4.2.'),
    // 'Context of use' is the inherited 'outcome' field
    scope: SystemComponent.pick({ reqType: true, id: true, name: true })
        .describe('The SystemComponent that defines the boundary of this use case'),
    // 'level' is subsumed by the inherited 'outcome' field
    preconditions: z.array(AssumptionReference).default([])
        .describe('State the system must be in before the use case starts'),
    trigger: EventReference
        .describe('The action upon the system that starts the use case.'),
    mainSuccessScenario: z.array(
        ScenarioStepReference
    ).default([]).describe('Structured sequence of action steps in the main success scenario'),
    successGuarantees: z.array(EffectReference).default([])
        .describe('Effects that are guaranteed to be true after the use case is completed successfully.'),
    extensions: z.array(
        ScenarioStepReference
    ).default([]).describe('Alternative and exception flows with both conditions and actions'),
    stakeholders: z.array(StakeholderReference).default([])
        .describe('The stakeholders in the use case'),
    reqType: z.nativeEnum(ReqType).default(ReqType.USE_CASE)
}).describe('A Use Case describes a complete interaction between an actor and the system to achieve a goal.')

export type UseCaseType = z.infer<typeof UseCase>
