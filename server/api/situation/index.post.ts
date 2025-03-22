import { Situation } from "#shared/domain"

export default postRequirementHttpHandler(
    Situation.pick({
        reqType: true,
        reqId: true,
        name: true,
        description: true
    })
)
