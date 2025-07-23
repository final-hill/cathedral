import { z } from 'zod'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor } from '~/application'
import { OrganizationRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization } from '#shared/domain'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const querySchema = z.object({
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined
}, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Returns all appusers for the organization with their associated role
 */
export default defineEventHandler(async (event) => {
    const { organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
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
        })

    return await organizationInteractor.getAppUsers().catch(handleDomainException)
})
