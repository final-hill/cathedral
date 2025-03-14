import { UserStory } from "#shared/domain"

export default findRequirementsHttpHandler(
    UserStory.pick({
        reqType: true,
        name: true,
        description: true,
        primaryActor: true,
        priority: true,
        outcome: true,
        functionalBehavior: true,
        isSilence: true
    }).partial().required({ reqType: true })
)