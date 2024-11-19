import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { getServerSession } from '#auth'
import { AppRole, } from "~/domain/application/index.js"
import { OrganizationInteractor } from "~/application"

const bodySchema = z.object({
    email: z.string(),
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional(),
    role: z.nativeEnum(AppRole)
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Invite an appuser to an organization with a role
 */
export default defineEventHandler(async (event) => {
    const { email, organizationId, organizationSlug, role } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            entityManager: fork(),
            organizationId,
            organizationSlug
        })

    return await organizationInteractor.addAppUserToOrganization({ email, role })
})