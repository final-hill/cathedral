import { Stakeholder } from "#shared/domain"

export default putRequirementHttpHandler(
    Stakeholder.pick({
        reqType: true,
        name: true,
        description: true,
        parentComponent: true,
        availability: true,
        influence: true,
        segmentation: true,
        category: true,
        isSilence: true
    }).partial().required({ reqType: true })
)