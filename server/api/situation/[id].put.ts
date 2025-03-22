import { Situation } from "#shared/domain"

export default putRequirementHttpHandler(
    Situation.pick({
        reqType: true,
        reqId: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)
