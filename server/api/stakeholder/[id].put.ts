import { Stakeholder } from "#shared/domain"

export default putRequirementHttpHandler(
    Stakeholder.pick({
        reqType: true,
        reqId: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        parentComponent: true,
        interest: true,
        influence: true,
        segmentation: true,
        category: true
    }).partial().required({ reqType: true, reqIdPrefix: true })
)