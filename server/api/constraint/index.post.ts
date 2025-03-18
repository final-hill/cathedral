import { Constraint } from "#shared/domain"

export default postRequirementHttpHandler(
    Constraint.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        category: true
    })
)