import { z } from "zod"
import { Stakeholder, StakeholderSegmentation, StakeholderCategory } from "~/domain/requirements/index.js"

/**
 * Updates a stakeholder by id.
 */
export default putRequirementHttpHandler({
    ReqClass: Stakeholder,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        parentComponentId: z.string().uuid().optional(),
        availability: z.number().min(0).max(100).optional(),
        influence: z.number().min(0).max(100).optional(),
        segmentation: z.nativeEnum(StakeholderSegmentation).optional(),
        category: z.nativeEnum(StakeholderCategory).optional(),
        isSilence: z.boolean().optional()
    })
})