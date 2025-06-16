import { z } from "zod"
import { ConstraintCategory, MoscowPriority, ReqType, StakeholderCategory, StakeholderSegmentation, UseCase } from "~/shared/domain"

export const llmRequirementSchema = z.object({
    reqType: z.nativeEnum(ReqType),
    name: z.string().describe('The name of the requirement'),
    description: z.string().describe('The statement describing the requirement'),
    moscowPriority: z.nativeEnum(MoscowPriority).describe('The priority of the requirement, using the MoSCoW method',).or(z.null()),
    email: z.string().describe('The email of the person').or(z.null()),
    primaryActorName: z.string().describe(
        'The name of the primary actor associated with the Scenario: (Epic, User Story, or Use Case)'
    ).or(z.null()),
    outcomeName: z.string().describe(
        'The name of the outcome (goal) associated with the Scenario: (Epic, User Story, or Use Case)'
    ).or(z.null()),
    stakeholderSegmentation: z.nativeEnum(StakeholderSegmentation).describe('The segmentation of the stakeholder').or(z.null()),
    stakeholderCategory: z.nativeEnum(StakeholderCategory).describe('The category of the stakeholder').or(z.null()),
    constraintCategory: z.nativeEnum(ConstraintCategory).describe('The category of the constraint').or(z.null()),
    useCaseScope: z.string().describe(UseCase.shape.scope.description!).or(z.null()),
    useCaseLevel: z.string().describe(UseCase.shape.level.description!).or(z.null()),
    useCasePreconditionName: z.string().describe(
        'The name of the precondition (Assumption) associated with the Use Case'
    ).or(z.null()),
    useCaseMainSuccessScenario: z.string().describe(UseCase.shape.mainSuccessScenario.description!).or(z.null()),
    useCaseSuccessGuaranteeName: z.string().describe(
        'The name of the success guarantee (Effect) associated with the Use Case'
    ).or(z.null()),
    useCaseExtensions: z.string().describe(UseCase.shape.extensions.description!).or(z.null()),
    userStoryFunctionalBehaviorName: z.string().describe(
        'The name of the functional behavior associated with the User Story'
    ).or(z.null())
})

export default z.object({
    requirements: z.array(llmRequirementSchema)
})