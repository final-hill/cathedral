import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { ScenarioStepTypeEnum } from './ScenarioStepTypeEnum.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

/**
 * Base entity reference schema for requirements
 */
export type RequirementReferenceType = z.infer<typeof RequirementReference>
export const RequirementReference = z.object({
    reqType: z.nativeEnum(ReqType),
    id: z.string().uuid(),
    name: z.string(),
    workflowState: z.string(),
    lastModified: z.date(),
    reqIdPrefix: z.string().optional(),
    uiBasePathTemplate: z.string().optional()
})

/**
 * Pre-defined entity reference types to avoid circular imports
 */
export type StakeholderReferenceType = z.infer<typeof StakeholderReference>
export const StakeholderReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.STAKEHOLDER),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.STAKEHOLDER])
})

export type AssumptionReferenceType = z.infer<typeof AssumptionReference>
export const AssumptionReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.ASSUMPTION),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.ASSUMPTION])
})

export type ConstraintReferenceType = z.infer<typeof ConstraintReference>
export const ConstraintReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.CONSTRAINT),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.CONSTRAINT])
})

export type EffectReferenceType = z.infer<typeof EffectReference>
export const EffectReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.EFFECT),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.EFFECT])
})

export type ComponentReferenceType = z.infer<typeof ComponentReference>
export const ComponentReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.COMPONENT),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.COMPONENT])
})

export type SystemComponentReferenceType = z.infer<typeof SystemComponentReference>
export const SystemComponentReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.SYSTEM_COMPONENT),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.SYSTEM_COMPONENT])
})

export type OutcomeReferenceType = z.infer<typeof OutcomeReference>
export const OutcomeReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.OUTCOME),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.OUTCOME])
})

export type FunctionalityReferenceType = z.infer<typeof FunctionalityReference>
export const FunctionalityReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.FUNCTIONALITY),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.FUNCTIONALITY])
})

export type FunctionalBehaviorReferenceType = z.infer<typeof FunctionalBehaviorReference>
export const FunctionalBehaviorReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.FUNCTIONAL_BEHAVIOR),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.FUNCTIONAL_BEHAVIOR])
})

export type BehaviorReferenceType = z.infer<typeof BehaviorReference>
export const BehaviorReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.BEHAVIOR),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.BEHAVIOR])
})

export type UseCaseReferenceType = z.infer<typeof UseCaseReference>
export const UseCaseReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.USE_CASE),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.USE_CASE])
})

export type UserStoryReferenceType = z.infer<typeof UserStoryReference>
export const UserStoryReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.USER_STORY),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.USER_STORY])
})

export type ScenarioReferenceType = z.infer<typeof ScenarioReference>
export const ScenarioReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.SCENARIO),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.SCENARIO])
})

export type ScenarioStepReferenceType = z.infer<typeof ScenarioStepReference>
export const ScenarioStepReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.SCENARIO_STEP),
    stepType: z.nativeEnum(ScenarioStepTypeEnum),
    parentStepId: z.string().uuid().optional().describe('Reference to parent step for hierarchical structure'),
    order: z.number().int().min(0).describe('Position among sibling steps (0-based, determines display order)')
})

export type ScenarioStepSuggestionType = z.infer<typeof ScenarioStepSuggestion>
export const ScenarioStepSuggestion = z.object({
    reqType: z.nativeEnum(ReqType).default(ReqType.SCENARIO_STEP),
    name: z.string(),
    stepType: z.nativeEnum(ScenarioStepTypeEnum),
    parentStepId: z.string().uuid().optional().describe('Reference to parent step for hierarchical structure'),
    order: z.number().int().min(0).describe('Position among sibling steps (0-based, determines display order)')
})

export type InterfaceReferenceType = z.infer<typeof InterfaceReference>
export const InterfaceReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.INTERFACE])
})

export type ActorReferenceType = z.infer<typeof ActorReference>
export const ActorReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.ACTOR)
})

export type InterfaceSchemaReferenceType = z.infer<typeof InterfaceSchemaReference>
export const InterfaceSchemaReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE_SCHEMA),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.INTERFACE_SCHEMA])
})

export type InterfaceOperationReferenceType = z.infer<typeof InterfaceOperationReference>
export const InterfaceOperationReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE_OPERATION),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.INTERFACE_OPERATION])
})

export type OrganizationReferenceType = z.infer<typeof OrganizationReference>
export const OrganizationReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.ORGANIZATION),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.ORGANIZATION])
})

export type SolutionReferenceType = z.infer<typeof SolutionReference>
export const SolutionReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.SOLUTION),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.SOLUTION])
})

export type ParsedRequirementsReferenceType = z.infer<typeof ParsedRequirementsReference>
export const ParsedRequirementsReference = RequirementReference.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.PARSED_REQUIREMENTS),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.PARSED_REQUIREMENTS])
})
