import { Limit } from "#shared/domain"

export default putRequirementHttpHandler(
    Limit.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    }).partial().required({ reqType: true })
)