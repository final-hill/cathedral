import { Constraint } from "#shared/domain"

export default findRequirementsHttpHandler(
    Constraint.pick({
        reqType: true,
        name: true,
        description: true,
        category: true
    }).partial().required({ reqType: true })
)