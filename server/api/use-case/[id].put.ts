import { UseCase } from "#shared/domain"

export default putRequirementHttpHandler(
    UseCase.pick({
        reqType: true,
        reqIdPrefix: true,
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
    }).partial().required({ reqType: true })
)