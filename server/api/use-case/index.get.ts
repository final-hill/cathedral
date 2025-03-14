import { UseCase } from "#shared/domain"

export default findRequirementsHttpHandler(
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
        extensions: true,
        isSilence: true
    }).partial().required({ reqType: true })
)