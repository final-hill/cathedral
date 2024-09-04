import { fork } from "~/server/data/orm"
import { z } from "zod"
import Organization from "~/server/domain/application/Organization"

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
 * Returns all solutions that match the optional query parameters
 */
export default defineEventHandler(async (event) => {
    const { description, name, organizationId, organizationSlug, slug } = await validateEventQuery(event, querySchema),
        em = fork()

    const organization = await em.findOne(Organization, {
        ...(organizationId ? { id: organizationId } : {}),
        ...(organizationSlug ? { slug: organizationSlug } : {}),
    }, { populate: ['solutions'] })

    await assertOrgReader(event, organization!.id)

    return organization!.solutions
        .filter((sol) =>
            name ? sol.name === name : true &&
                description ? sol.description === description : true &&
                    slug ? sol.slug === slug : true
        )
})