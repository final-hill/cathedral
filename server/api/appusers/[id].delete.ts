import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional()
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Delete an appuser by id in a given organization
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            entityManager: fork(),
            organizationId,
            organizationSlug
        })

    await organizationInteractor.deleteAppUser(id)
})