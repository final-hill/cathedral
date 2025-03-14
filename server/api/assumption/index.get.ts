import { Assumption } from "#shared/domain"

export default findRequirementsHttpHandler(
    Assumption.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    }).partial().required({ reqType: true })
)