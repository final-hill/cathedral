import { z } from "zod";
import { ParsedRequirement } from "~/domain/requirements";

/**
 * Returns all ParsedRequirements that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: ParsedRequirement,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})