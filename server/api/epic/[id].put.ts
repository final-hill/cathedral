import { Epic } from "#shared/domain"

export default putRequirementHttpHandler(
    Epic.pick({
        reqType: true,
        reqId: true,
        reqIdPrefix: true,
        name: true,
        priority: true,
        primaryActor: true,
        outcome: true,
        description: true,
        functionalBehavior: true
    }).partial().required({ reqType: true, reqIdPrefix: true })
)