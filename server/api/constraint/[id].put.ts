import { Constraint } from "#shared/domain"

export default putRequirementHttpHandler(
    Constraint.pick({
        reqType: true,
        name: true,
        description: true,
        category: true
    }).partial().required({ reqType: true })
)