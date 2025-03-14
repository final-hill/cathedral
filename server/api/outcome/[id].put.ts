import { Outcome } from "#shared/domain"

export default putRequirementHttpHandler(
    Outcome.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    }).partial().required({ reqType: true })
)