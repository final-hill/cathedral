import { Epic } from "#shared/domain"

export default postRequirementHttpHandler(
    Epic.pick({
        reqType: true,
        name: true,
        priority: true,
        primaryActor: true,
        outcome: true,
        description: true,
        functionalBehavior: true,
        isSilence: true
    })
)