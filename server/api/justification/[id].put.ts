import { Justification } from "#shared/domain"

export default putRequirementHttpHandler(
    Justification.pick({
        reqType: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)