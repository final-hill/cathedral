import { z } from 'zod'
import { ConstraintCategory, MoscowPriority, ReqType, ScenarioStepTypeEnum, StakeholderCategory, StakeholderSegmentation } from '#shared/domain'

export const llmRequirementSchema = z.object({
    reqType: z.nativeEnum(ReqType),
    name: z.string().describe('The name of the requirement'),
    description: z.string().describe('The statement describing the requirement'),
    email: z.string().describe('The email of the person').or(z.null()),
    priority: z.nativeEnum(MoscowPriority).describe(
        'The MoSCoW Priority for Behaviors and Scenarios'
    ).or(z.null()),
    primaryActorName: z.string().describe(
        'The name of the primary actor associated with Scenarios: (User Story, Use Case, or Test Case)'
    ).or(z.null()),
    outcomeName: z.string().describe(
        'The name of the outcome (goal) associated with Scenarios: (User Story, Use Case, or Test Case)'
    ).or(z.null()),
    stakeholderSegmentation: z.nativeEnum(StakeholderSegmentation).describe('The segmentation of the stakeholder').or(z.null()),
    stakeholderCategory: z.nativeEnum(StakeholderCategory).describe('The category of the stakeholder').or(z.null()),
    constraintCategory: z.nativeEnum(ConstraintCategory).describe('The category of the constraint').or(z.null()),
    useCaseScopeName: z.string().describe(
        'The name of the SystemComponent that defines the boundary of the Use Case'
    ).or(z.null()),
    useCasePreconditionNames: z.array(z.string()).describe(
        'The names of the preconditions (Assumptions) associated with the Use Case'
    ).or(z.null()),
    useCaseMainSuccessScenarioSteps: z.array(z.object({
        stepNumber: z.string().describe('Step number in sequence (e.g., "1", "2", "3")'),
        name: z.string().describe('Brief step name'),
        description: z.string().describe('Detailed step description'),
        stepType: z.nativeEnum(ScenarioStepTypeEnum).describe('Whether this is an action or conditional branch'),
        actorName: z.string().optional().describe('Name of the actor performing this step'),
        functionalBehaviorName: z.string().optional().describe('Name of the functional behavior for this step')
    })).describe('Main success scenario steps for Use Cases').or(z.null()),
    useCaseSuccessGuaranteeNames: z.array(z.string()).describe(
        'The names of the success guarantees (Effects) associated with the Use Case'
    ).or(z.null()),
    useCaseExtensionSteps: z.array(z.object({
        parentStepNumber: z.string().describe('The main step this extends (e.g., "1", "2") or extension type ("A", "B" for top-level)'),
        stepNumber: z.string().describe('Extension step identifier (e.g., "1a.1", "2a.1", "A.1", "B.1")'),
        name: z.string().describe('Brief step name'),
        description: z.string().describe('Detailed step description'),
        stepType: z.nativeEnum(ScenarioStepTypeEnum).describe('Whether this is an action or conditional branch'),
        conditionNames: z.array(z.string()).optional().describe('Condition names for conditional steps'),
        actorName: z.string().optional().describe('Name of the actor performing this step'),
        functionalBehaviorName: z.string().optional().describe('Name of the functional behavior for this step')
    })).describe('Extension and alternative flow steps for Use Cases').or(z.null()),
    useCaseStakeholderNames: z.array(z.string()).describe(
        'The names of the stakeholders associated with the Use Case'
    ).or(z.null()),
    scenarioFunctionalBehaviorName: z.string().describe(
        'The name of the functional behavior associated with the Scenario (User Story, Use Case, or Test Case)'
    ).or(z.null()),
    functionalityRelatedBehaviorName: z.string().describe(
        'The name of the functional behavior that implements this high-level functionality'
    ).or(z.null())
})

export default z.object({
    requirements: z.array(llmRequirementSchema)
})
