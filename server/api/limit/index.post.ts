import { Limit } from "#shared/domain"

export default postRequirementHttpHandler(
    Limit.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    })
)