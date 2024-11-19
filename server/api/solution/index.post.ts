import { getServerSession } from '#auth'
import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { OrganizationInteractor } from "~/application"

const bodySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string(),
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional(),
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Creates a new solution and returns its slug
 */
export default defineEventHandler(async (event) => {
    const { description, name, organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            entityManager: fork(),
            organizationId,
            organizationSlug
        }),
        newSolution = await organizationInteractor.addSolution({ name, description })

    return newSolution.slug
})