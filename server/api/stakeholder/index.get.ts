import { Stakeholder, } from "#shared/domain"

export default findRequirementsHttpHandler(
    Stakeholder.pick({
        reqType: true,
        name: true,
        description: true,
        parentComponent: true,
        availability: true,
        influence: true,
        segmentation: true,
        category: true
    }).partial().required({ reqType: true })
)