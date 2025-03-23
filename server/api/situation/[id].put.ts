import { Situation } from "#shared/domain"

export default putRequirementHttpHandler(
    Situation.pick({
        reqType: true,
        reqId: true,
        reqIdPrefix: true,
        name: true,
        description: true
    }).partial().required({ reqType: true, reqIdPrefix: true })
)
