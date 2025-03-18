import { Assumption } from '#shared/domain'

export default putRequirementHttpHandler(
    Assumption.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)