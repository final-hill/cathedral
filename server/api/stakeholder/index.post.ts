import { Stakeholder } from "#shared/domain"

export default postRequirementHttpHandler(
    Stakeholder.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        parentComponent: true,
        availability: true,
        influence: true,
        segmentation: true,
        category: true
    })
)