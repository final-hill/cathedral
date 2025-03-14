import { FunctionalBehavior } from "#shared/domain"

export default putRequirementHttpHandler(
    FunctionalBehavior.pick({
        reqType: true,
        name: true,
        description: true,
        priority: true,
        isSilence: true
    }).partial().required({ reqType: true })
)