import { NonFunctionalBehavior } from "#shared/domain"

export default putRequirementHttpHandler(
    NonFunctionalBehavior.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        priority: true
    }).partial().required({ reqType: true })
)