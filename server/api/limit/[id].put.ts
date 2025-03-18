import { Limit } from "#shared/domain"

export default putRequirementHttpHandler(
    Limit.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)