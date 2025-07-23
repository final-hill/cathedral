import { z } from 'zod'
import { AppUser, AppUserOrganizationRole, Organization } from '#shared/domain'
import { OrganizationCollectionInteractor, PermissionInteractor } from '~/application'
import { OrganizationCollectionRepository } from '~/server/data/repositories'
import { AppUserInteractor } from '~/application/AppUserInteractor'
import handleDomainException from '~/server/utils/handleDomainException'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    ...AppUser.pick({ email: true }).required().shape,
    ...AppUserOrganizationRole.pick({ role: true }).required().shape,
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined
}, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Invite an appuser to an organization with a role
 */
export default defineEventHandler(async (event) => {
    const { email, organizationId, organizationSlug, role } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        permissionInteractor = new PermissionInteractor({
            session,
            groupService: createEntraGroupService()
        }),
        appUserInteractor = new AppUserInteractor({
            permissionInteractor,
            groupService: createEntraGroupService()
        }),
        organizationInteractor = new OrganizationCollectionInteractor({
            permissionInteractor,
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            entraGroupService: createEntraGroupService()
        })

    try {
        const orgId = organizationId ?? (await organizationInteractor.findOrganizations({ slug: organizationSlug }))[0]?.id,
            appUser = (await appUserInteractor.getUserByEmail(email))!

        return await permissionInteractor.addAppUserOrganizationRole({
            appUserId: appUser.id,
            organizationId: orgId,
            role
        })
    } catch (error: unknown) {
        return handleDomainException(error)
    }
})
