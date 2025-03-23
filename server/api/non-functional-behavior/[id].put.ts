import { NonFunctionalBehavior } from "#shared/domain"

export default putRequirementHttpHandler(
    NonFunctionalBehavior.pick({
        reqType: true,
        reqId: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        priority: true
    }).partial().required({ reqType: true, reqIdPrefix: true })
)