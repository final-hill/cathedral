import { UserStory } from "#shared/domain"

export default putRequirementHttpHandler(
    UserStory.pick({
        reqType: true,
        reqId: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        primaryActor: true,
        priority: true,
        outcome: true,
        functionalBehavior: true
    }).partial().required({ reqType: true, reqIdPrefix: true })
)