import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { ScenarioStepTypeEnum } from './ScenarioStepTypeEnum.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { WorkflowState } from './WorkflowState.js'

/**
 * Base entity reference schema for requirements
 */
export type RequirementReferenceType = z.infer<typeof RequirementReference>
export const RequirementReference = z.object({
    reqType: z.enum(ReqType),
    id: z.uuid(),
    name: z.string(),
    workflowState: z.enum(WorkflowState),
    lastModified: z.coerce.date(),
    reqIdPrefix: z.string().optional(),
    uiBasePathTemplate: z.string().optional()
})

/**
 * Reference to a specific version of a requirement
 */
export type RequirementVersionReferenceType = z.infer<typeof RequirementVersionReference>
export const RequirementVersionReference = z.object({
    reqType: z.enum(ReqType),
    requirementId: z.uuid(),
    effectiveFrom: z.coerce.date(),
    name: z.string(),
    workflowState: z.enum(WorkflowState),
    reqIdPrefix: z.string().optional(),
    uiBasePathTemplate: z.string().optional()
})

/**
 * Pre-defined entity reference types to avoid circular imports
 */
export type StakeholderReferenceType = z.infer<typeof StakeholderReference>
export const StakeholderReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.STAKEHOLDER),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.STAKEHOLDER])
})

export type AssumptionReferenceType = z.infer<typeof AssumptionReference>
export const AssumptionReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.ASSUMPTION),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.ASSUMPTION])
})

export type ConstraintReferenceType = z.infer<typeof ConstraintReference>
export const ConstraintReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.CONSTRAINT),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.CONSTRAINT])
})

export type EffectReferenceType = z.infer<typeof EffectReference>
export const EffectReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.EFFECT),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.EFFECT])
})

export type ComponentReferenceType = z.infer<typeof ComponentReference>
export const ComponentReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.COMPONENT),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.COMPONENT])
})

export type SystemComponentReferenceType = z.infer<typeof SystemComponentReference>
export const SystemComponentReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.SYSTEM_COMPONENT),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.SYSTEM_COMPONENT])
})

export type OutcomeReferenceType = z.infer<typeof OutcomeReference>
export const OutcomeReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.OUTCOME),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.OUTCOME])
})

export type FunctionalityReferenceType = z.infer<typeof FunctionalityReference>
export const FunctionalityReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.FUNCTIONALITY),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.FUNCTIONALITY])
})

export type FunctionalityOverviewReferenceType = z.infer<typeof FunctionalityOverviewReference>
export const FunctionalityOverviewReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.FUNCTIONALITY_OVERVIEW),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.FUNCTIONALITY_OVERVIEW])
})

export type FunctionalBehaviorReferenceType = z.infer<typeof FunctionalBehaviorReference>
export const FunctionalBehaviorReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.FUNCTIONAL_BEHAVIOR),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.FUNCTIONAL_BEHAVIOR])
})

export type BehaviorReferenceType = z.infer<typeof BehaviorReference>
export const BehaviorReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.BEHAVIOR),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.BEHAVIOR])
})

export type UseCaseReferenceType = z.infer<typeof UseCaseReference>
export const UseCaseReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.USE_CASE),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.USE_CASE])
})

export type UserStoryReferenceType = z.infer<typeof UserStoryReference>
export const UserStoryReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.USER_STORY),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.USER_STORY])
})

export type ScenarioStepReferenceType = z.infer<typeof ScenarioStepReference>
export const ScenarioStepReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.SCENARIO_STEP),
    stepType: z.enum(ScenarioStepTypeEnum),
    parentStepId: z.uuid().optional().describe('Reference to parent step for hierarchical structure'),
    order: z.int().min(0).describe('Position among sibling steps (0-based, determines display order)')
})

export type ScenarioStepSuggestionType = z.infer<typeof ScenarioStepSuggestion>
export const ScenarioStepSuggestion = z.object({
    reqType: z.enum(ReqType).prefault(ReqType.SCENARIO_STEP),
    name: z.string(),
    stepType: z.enum(ScenarioStepTypeEnum),
    parentStepId: z.uuid().optional().describe('Reference to parent step for hierarchical structure'),
    order: z.int().min(0).describe('Position among sibling steps (0-based, determines display order)')
})

export type InterfaceReferenceType = z.infer<typeof InterfaceReference>
export const InterfaceReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.INTERFACE),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.INTERFACE])
})

export type ActorReferenceType = z.infer<typeof ActorReference>
export const ActorReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.ACTOR)
})

export type InterfaceSchemaReferenceType = z.infer<typeof InterfaceSchemaReference>
export const InterfaceSchemaReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.INTERFACE_SCHEMA),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.INTERFACE_SCHEMA])
})

export type InterfaceOperationReferenceType = z.infer<typeof InterfaceOperationReference>
export const InterfaceOperationReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.INTERFACE_OPERATION),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.INTERFACE_OPERATION])
})

export type OrganizationReferenceType = z.infer<typeof OrganizationReference>
export const OrganizationReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.ORGANIZATION),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.ORGANIZATION])
})

export type SolutionReferenceType = z.infer<typeof SolutionReference>
export const SolutionReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.SOLUTION),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.SOLUTION])
})

export type ParsedRequirementsReferenceType = z.infer<typeof ParsedRequirementsReference>
export const ParsedRequirementsReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.PARSED_REQUIREMENTS),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.PARSED_REQUIREMENTS])
})

export type PersonReferenceType = z.infer<typeof PersonReference>
export const PersonReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.PERSON),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.PERSON])
})

export type ExampleReferenceType = z.infer<typeof ExampleReference>
export const ExampleReference = RequirementReference.extend({
    reqType: z.enum(ReqType).prefault(ReqType.EXAMPLE),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.EXAMPLE])
})
