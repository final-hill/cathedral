import { NonFunctionalBehavior } from "#shared/domain"

export default findRequirementsHttpHandler(
    NonFunctionalBehavior.pick({
        reqType: true,
        name: true,
        description: true,
        priority: true
    }).partial().required({ reqType: true })
)