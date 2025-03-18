import { Outcome } from "#shared/domain"

export default postRequirementHttpHandler(
    Outcome.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    })
)