import { Effect } from "#shared/domain"

export default findRequirementsHttpHandler(
    Effect.pick({
        reqType: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)