import { Outcome } from "#shared/domain"

export default postRequirementHttpHandler(
    Outcome.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    })
)