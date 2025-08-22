import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { ScenarioStepTypeEnum } from './ScenarioStepTypeEnum.js'

/**
 * Base entity reference schema for requirements
 */
export const BaseEntityReference = z.object({
    reqType: z.nativeEnum(ReqType),
    id: z.string().uuid(),
    name: z.string()
})

/**
 * Pre-defined entity reference types to avoid circular imports
 */
export const StakeholderReference = BaseEntityReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.STAKEHOLDER)
})

export const AssumptionReference = BaseEntityReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.ASSUMPTION)
})

export const EffectReference = BaseEntityReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.EFFECT)
})

export const SystemComponentReference = BaseEntityReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.SYSTEM_COMPONENT)
})

export const OutcomeReference = BaseEntityReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.OUTCOME)
})

export const FunctionalBehaviorReference = BaseEntityReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.FUNCTIONAL_BEHAVIOR)
})

export const UseCaseReference = BaseEntityReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.USE_CASE)
})

export const ScenarioStepReference = BaseEntityReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.SCENARIO_STEP),
    stepNumber: z.string(),
    stepType: z.nativeEnum(ScenarioStepTypeEnum)
})

export const ScenarioStepSuggestion = z.object({
    reqType: z.nativeEnum(ReqType).default(ReqType.SCENARIO_STEP),
    name: z.string(),
    stepNumber: z.string(),
    stepType: z.nativeEnum(ScenarioStepTypeEnum)
})

export const EventReference = BaseEntityReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.EVENT)
})

// Export types for use in other files
export type BaseEntityReferenceType = z.infer<typeof BaseEntityReference>
export type StakeholderReferenceType = z.infer<typeof StakeholderReference>
export type AssumptionReferenceType = z.infer<typeof AssumptionReference>
export type EffectReferenceType = z.infer<typeof EffectReference>
export type SystemComponentReferenceType = z.infer<typeof SystemComponentReference>
export type OutcomeReferenceType = z.infer<typeof OutcomeReference>
export type FunctionalBehaviorReferenceType = z.infer<typeof FunctionalBehaviorReference>
export type UseCaseReferenceType = z.infer<typeof UseCaseReference>
export type ScenarioStepReferenceType = z.infer<typeof ScenarioStepReference>
export type ScenarioStepSuggestionType = z.infer<typeof ScenarioStepSuggestion>
export type EventReferenceType = z.infer<typeof EventReference>
