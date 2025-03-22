import { ContextAndObjective } from "#shared/domain"

export default findRequirementsHttpHandler(
    ContextAndObjective.pick({
        reqType: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)