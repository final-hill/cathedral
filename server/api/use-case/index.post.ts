import { UseCase } from "#shared/domain"

export default postRequirementHttpHandler(
    UseCase.pick({
        reqType: true,
        name: true,
        description: true,
        primaryActor: true,
        priority: true,
        scope: true,
        level: true,
        outcome: true,
        precondition: true,
        trigger: true,
        mainSuccessScenario: true,
        successGuarantee: true,
        extensions: true
    })
)