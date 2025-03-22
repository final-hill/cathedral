import { ContextAndObjective } from "#shared/domain"

export default putRequirementHttpHandler(
    ContextAndObjective.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)