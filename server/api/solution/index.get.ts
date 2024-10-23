import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { ReqType, Solution } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations";

const querySchema = z.object({
    name: z.string().max(100).optional(),
    description: z.string().optional(),
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional(),
    slug: z.string().max(100).optional()
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Returns all solutions that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const { description, name, organizationId, organizationSlug, slug } = await validateEventQuery(event, querySchema),
        em = fork(),
        solsBelongsToOrgs = await em.find(Belongs, {
            left: {
                req_type: ReqType.SOLUTION,
                ...(name ? { name } : {}),
                ...(description ? { description } : {}),
                ...(slug ? { slug } : {}),
            },
            right: {
                req_type: ReqType.ORGANIZATION,
                ...(organizationId ? { id: organizationId } : {}),
                ...(organizationSlug ? { slug: organizationSlug } : {}),
            }
        }, { populate: ['left', 'right'] })

    await assertOrgReader(event, solsBelongsToOrgs[0].right.id)

    return solsBelongsToOrgs.map((sol) => sol.left as Solution)
})