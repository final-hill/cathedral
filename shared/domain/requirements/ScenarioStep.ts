import { z } from 'zod'
import { Scenario } from './Scenario.js'
import { ReqType } from './ReqType.js'
import { ScenarioStepTypeEnum } from './ScenarioStepTypeEnum.js'
import { UseCaseReference, AssumptionReference } from './EntityReferences.js'

export const ScenarioStep = Scenario.extend({
    stepNumber: z.string()
        .describe('Hierarchical step identifier (e.g., "1", "3.1", "A", "A.2.1")'),
    stepType: z.nativeEnum(ScenarioStepTypeEnum)
        .describe('Whether this step represents an action or a conditional branch'),
    parentScenario: UseCaseReference
        .describe('The Use Case this step belongs to'),
    preconditions: z.array(AssumptionReference).default([])
        .optional().describe('Conditions that must be true for this step/branch to execute'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SCENARIO_STEP)
}).describe('A single step within a scenario describing actor-system interaction or conditional branching')

export type ScenarioStepType = z.infer<typeof ScenarioStep>
