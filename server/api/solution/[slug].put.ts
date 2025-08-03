import { z } from 'zod'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor } from '~/application'
import { OrganizationRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization, Solution } from '#shared/domain'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const paramSchema = Solution.innerType().pick({ slug: true })

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    ...Solution.innerType().pick({ name: true, description: true }).partial().shape,
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined
}, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Updates a solution by slug
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug, ...body } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        permissionInteractor = new PermissionInteractor({
            event,
            session,
            groupService: createEntraGroupService()
        }),
        organizationInteractor = new OrganizationInteractor({
            permissionInteractor,
            appUserInteractor: new AppUserInteractor({
                permissionInteractor,
                groupService: createEntraGroupService()
            }),
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug })
        })

    await organizationInteractor.updateSolutionBySlug(slug, body).catch(handleDomainException)
})
