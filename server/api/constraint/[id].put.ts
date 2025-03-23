import { Constraint } from "#shared/domain"

export default putRequirementHttpHandler(
    Constraint.pick({
        reqType: true,
        reqId: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        category: true
    }).partial().required({ reqType: true, reqIdPrefix: true })
)