import { Assumption } from "#shared/domain"

export default postRequirementHttpHandler(
    Assumption.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    })
)