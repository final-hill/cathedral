import { Epic } from "#shared/domain"

export default postRequirementHttpHandler(
    Epic.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        priority: true,
        primaryActor: true,
        outcome: true,
        description: true,
        functionalBehavior: true
    })
)