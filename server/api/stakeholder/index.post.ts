import { z } from "zod"
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from "~/domain/requirements/index.js"

/**
 * Creates a new stakeholder and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: Stakeholder,
    bodySchema: z.object({
        name: z.string().default("{Untitled Stakeholder}"),
        description: z.string().default(""),
        parentComponentId: z.string().uuid().optional(),
        availability: z.number().min(0).max(100).default(50),
        influence: z.number().min(0).max(100).default(50),
        segmentation: z.nativeEnum(StakeholderSegmentation).optional(),
        category: z.nativeEnum(StakeholderCategory).optional(),
        isSilence: z.boolean().default(false)
    })
})