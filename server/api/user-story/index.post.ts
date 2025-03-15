import { UserStory } from "#shared/domain"

export default postRequirementHttpHandler(
    UserStory.pick({
        reqType: true,
        name: true,
        description: true,
        primaryActor: true,
        priority: true,
        outcome: true,
        functionalBehavior: true
    })
)