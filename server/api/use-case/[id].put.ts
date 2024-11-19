import { z } from "zod"
import { MoscowPriority, UseCase } from "~/domain/requirements/index.js"

/**
 * Updates a UseCase by id
 */
export default putRequirementHttpHandler({
    ReqClass: UseCase,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        primaryActor: z.string().uuid().optional(),
        priority: z.nativeEnum(MoscowPriority).optional(),
        scope: z.string().optional(),
        level: z.string().optional(),
        outcome: z.string().uuid().optional(),
        precondition: z.string().uuid().optional(),
        triggerId: z.string().uuid().optional(),
        mainSuccessScenario: z.string().optional(),
        successGuarantee: z.string().uuid().optional(),
        extensions: z.string().optional(),
        isSilence: z.boolean().optional()
    })
})