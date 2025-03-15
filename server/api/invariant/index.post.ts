import { Invariant } from "#shared/domain"

export default postRequirementHttpHandler(
    Invariant.pick({
        reqType: true,
        name: true,
        description: true
    })
)