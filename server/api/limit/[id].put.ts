import { Limit } from "#shared/domain"

export default putRequirementHttpHandler(
    Limit.pick({
        reqType: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)