import { NonFunctionalBehavior } from "#shared/domain"

export default postRequirementHttpHandler(
    NonFunctionalBehavior.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        priority: true
    })
)