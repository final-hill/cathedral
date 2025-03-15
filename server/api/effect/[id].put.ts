import { Effect } from "#shared/domain"

export default putRequirementHttpHandler(
    Effect.pick({
        reqType: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)