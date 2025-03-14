import { Epic } from "#shared/domain"

export default putRequirementHttpHandler(
    Epic.pick({
        reqType: true,
        name: true,
        priority: true,
        primaryActor: true,
        outcome: true,
        description: true,
        functionalBehavior: true,
        isSilence: true
    }).partial().required({ reqType: true })
)