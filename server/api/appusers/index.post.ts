import { z } from "zod"
import { AppUser, AppUserOrganizationRole, Organization } from "#shared/domain"
import { getServerSession } from '#auth'
import { OrganizationCollectionInteractor, PermissionInteractor } from "~/application"
import { AppUserRepository, OrganizationCollectionRepository, PermissionRepository } from "~/server/data/repositories";
import { AppUserInteractor } from "~/application/AppUserInteractor";
import handleDomainException from "~/server/utils/handleDomainException";

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    ...AppUser.pick({ email: true }).required().shape,
    ...AppUserOrganizationRole.pick({ role: true }).required().shape,
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Invite an appuser to an organization with a role
 */
export default defineEventHandler(async (event) => {
    const { email, organizationId, organizationSlug, role } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        permissionInteractor = new PermissionInteractor({
            userId: session.id,
            repository: new PermissionRepository({ em: event.context.em })
        }),
        appUserInteractor = new AppUserInteractor({
            permissionInteractor,
            repository: new AppUserRepository({ em: event.context.em })
        }),
        organizationInteractor = new OrganizationCollectionInteractor({
            permissionInteractor,
            repository: new OrganizationCollectionRepository({ em: event.context.em })
        })

    try {
        const orgId = organizationId ?? (await organizationInteractor.findOrganizations({ slug: organizationSlug }))[0]?.id,
            appUser = (await appUserInteractor.getAppUserByEmail(email))!

        return await permissionInteractor.addAppUserOrganizationRole({
            appUserId: appUser.id,
            organizationId: orgId,
            role
        })
    } catch (error: any) {
        return handleDomainException(error)
    }
})