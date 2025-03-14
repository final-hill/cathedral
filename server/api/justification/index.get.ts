import { Justification } from "#shared/domain"

export default findRequirementsHttpHandler(
    Justification.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    }).partial().required({ reqType: true })
)