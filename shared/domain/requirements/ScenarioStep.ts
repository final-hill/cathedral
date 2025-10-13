import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { ScenarioStepTypeEnum } from './ScenarioStepTypeEnum.js'
import { UseCaseReference, AssumptionReference, FunctionalBehaviorReference } from './EntityReferences.js'
import { Example } from './Example.js'

export const ScenarioStep = Example.extend({
    stepType: z.nativeEnum(ScenarioStepTypeEnum)
        .describe('Whether this step represents an action or a conditional branch'),
    parentScenario: UseCaseReference
        .describe('The Use Case this step belongs to'),
    parentStep: z.string().uuid().optional()
        .describe('Reference to parent step for hierarchical structure (null for top-level steps)'),
    order: z.number().int().min(0)
        .describe('Position among sibling steps (0-based, determines display order)'),
    preconditions: z.array(AssumptionReference).default([])
        .optional().describe('Conditions that must be true for this step/branch to execute'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SCENARIO_STEP),
    functionality: FunctionalBehaviorReference
        .describe('The functional behavior that this scenario step addresses')
}).describe('A single step within a scenario describing actor-system interaction or conditional branching')

export type ScenarioStepType = z.infer<typeof ScenarioStep>
