import { Outcome } from "#shared/domain"

export default putRequirementHttpHandler(
    Outcome.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)