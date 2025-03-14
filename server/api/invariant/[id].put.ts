import { Invariant } from "#shared/domain"

export default putRequirementHttpHandler(
    Invariant.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    }).partial().required({ reqType: true })
)