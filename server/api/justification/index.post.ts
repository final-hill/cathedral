import { Justification } from "#shared/domain"

export default postRequirementHttpHandler(
    Justification.pick({
        reqType: true,
        name: true,
        description: true
    })
)