import { z } from 'zod'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor } from '~/application'
import { OrganizationRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { AppUser, AppUserOrganizationRole, Organization } from '#shared/domain'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const paramSchema = AppUser.pick({ id: true }),
    { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    organizationId,
    organizationSlug,
    ...AppUserOrganizationRole.pick({ role: true }).required().shape
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined
}, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Update an appuser by id in a given organization to have a new role
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug, role } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        permissionInteractor = new PermissionInteractor({
            session,
            groupService: createEntraGroupService()
        }),
        organizationInteractor = new OrganizationInteractor({
            permissionInteractor,
            appUserInteractor: new AppUserInteractor({
                permissionInteractor,
                groupService: createEntraGroupService()
            }),
            repository: new OrganizationRepository({
                em: event.context.em,
                organizationId,
                organizationSlug
            })
        }),
        orgId = (await organizationInteractor.getOrganization()).id

    return await permissionInteractor.updateAppUserRole({ appUserId: id, organizationId: orgId, role })
        .catch(handleDomainException)
})
