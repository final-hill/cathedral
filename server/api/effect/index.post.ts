import { Effect } from "#shared/domain"

export default postRequirementHttpHandler(
    Effect.pick({
        reqType: true,
        name: true,
        description: true
    })
)