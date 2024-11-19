import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { getServerSession } from '#auth'
import { AppRole } from "~/domain/application/index.js"
import { OrganizationInteractor } from "~/application"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional(),
    role: z.nativeEnum(AppRole)
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Update an appuser by id in a given organization to have a new role
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug, role } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            entityManager: fork(),
            organizationId,
            organizationSlug
        })

    await organizationInteractor.updateAppUserRole(id, role)
})