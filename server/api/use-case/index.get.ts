import { z } from "zod"
import { MoscowPriority, UseCase } from "~/domain/requirements/index.js"
import { NIL as emptyUuid } from "uuid"

/**
 * Returns all stakeholders that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: UseCase,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        primaryActor: z.string().uuid().optional(),
        priority: z.nativeEnum(MoscowPriority).optional(),
        scope: z.string().optional(),
        level: z.string().optional(),
        outcome: z.string().uuid().optional(),
        precondition: z.string().uuid().optional(),
        triggerId: z.literal(emptyUuid).optional(),
        mainSuccessScenario: z.string().optional(),
        successGuarantee: z.string().uuid().optional(),
        extensions: z.string().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})