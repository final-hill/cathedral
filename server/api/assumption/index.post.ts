import { Assumption } from "#shared/domain"

export default postRequirementHttpHandler(
    Assumption.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    })
)