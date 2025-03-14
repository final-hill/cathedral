import { Assumption } from '#shared/domain'

export default putRequirementHttpHandler(
    Assumption.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    }).partial().required({ reqType: true })
)