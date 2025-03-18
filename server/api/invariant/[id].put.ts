import { Invariant } from "#shared/domain"

export default putRequirementHttpHandler(
    Invariant.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)