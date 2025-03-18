import { FunctionalBehavior } from "#shared/domain"

export default findRequirementsHttpHandler(
    FunctionalBehavior.pick({
        reqType: true,
        name: true,
        description: true,
        priority: true
    }).partial().required({ reqType: true })
)