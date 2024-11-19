import { fork } from "~/server/data/orm.js"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"
import { type ZodObject, z } from "zod"
import { Requirement } from "~/domain/requirements"

export default function findRequirementsHttpHandler<
    RCons extends typeof Requirement,
    Q extends ZodObject<any>
>({ ReqClass, querySchema }: { ReqClass: RCons, querySchema: Q }) {
    const validatedQuerySchema = querySchema.extend({
        solutionId: z.string().uuid(),
        organizationId: z.string().uuid().optional(),
        organizationSlug: z.string().max(100).optional()
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined;
    }, "At least one of organizationId or organizationSlug should be provided");

    return defineEventHandler(async (event) => {
        // FIXME: Zod sucks at type inference. see: https://github.com/colinhacks/zod/issues/2807
        const { solutionId, organizationId, organizationSlug, ...query } = await validateEventQuery(event, validatedQuerySchema) as any,
            session = (await getServerSession(event))!,
            organizationInteractor = new OrganizationInteractor({
                userId: session.id,
                organizationId,
                organizationSlug,
                entityManager: fork()
            })

        return await organizationInteractor.findRequirements({ solutionId, ReqClass, query })
    })
}