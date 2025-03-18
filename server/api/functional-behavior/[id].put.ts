import { FunctionalBehavior } from "#shared/domain"

export default putRequirementHttpHandler(
    FunctionalBehavior.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        priority: true
    }).partial().required({ reqType: true })
)