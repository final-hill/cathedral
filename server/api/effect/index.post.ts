import { Effect } from "#shared/domain"

export default postRequirementHttpHandler(
    Effect.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    })
)