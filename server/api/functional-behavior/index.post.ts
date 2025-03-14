import { FunctionalBehavior } from "#shared/domain"

export default postRequirementHttpHandler(
    FunctionalBehavior.pick({
        reqType: true,
        name: true,
        description: true,
        priority: true,
        isSilence: true
    })
)