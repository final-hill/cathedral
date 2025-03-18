import { FunctionalBehavior } from "#shared/domain"

export default postRequirementHttpHandler(
    FunctionalBehavior.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        priority: true
    })
)