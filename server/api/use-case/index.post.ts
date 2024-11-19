import { NIL as emptyUuid } from "uuid"
import { z } from "zod"
import { MoscowPriority, UseCase } from "~/domain/requirements/index.js"

/**
 * Creates a new use case and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: UseCase,
    bodySchema: z.object({
        name: z.string(),
        description: z.string(),
        primaryActor: z.string().uuid(),
        priority: z.nativeEnum(MoscowPriority),
        scope: z.string(),
        level: z.string(),
        outcome: z.string().uuid(),
        precondition: z.string().uuid(),
        triggerId: z.literal(emptyUuid),
        mainSuccessScenario: z.string(),
        successGuarantee: z.string().uuid(),
        extensions: z.string(),
        isSilence: z.boolean().default(false)
    })
})