import { Invariant } from "#shared/domain"

export default postRequirementHttpHandler(
    Invariant.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    })
)