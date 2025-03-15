import { NonFunctionalBehavior } from "#shared/domain"

export default postRequirementHttpHandler(
    NonFunctionalBehavior.pick({
        reqType: true,
        name: true,
        description: true,
        priority: true
    })
)