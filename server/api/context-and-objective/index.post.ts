import { ContextAndObjective } from "#shared/domain"

export default postRequirementHttpHandler(
    ContextAndObjective.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    })
)