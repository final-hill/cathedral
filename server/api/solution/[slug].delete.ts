import { getServerSession } from '#auth'
import { z } from "zod"
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor } from '~/application'
import { AppUserRepository, OrganizationRepository, PermissionRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization, Solution } from '#shared/domain'

// TODO: this feels backwards. Shouldn't the param be the organizationSlug and the body be the solutionSlug?

const paramSchema = Solution.innerType().pick({ slug: true })

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Delete a solution by slug.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        permissionInteractor = new PermissionInteractor({
            userId: session.id,
            repository: new PermissionRepository({ em: event.context.em })
        }),
        organizationInteractor = new OrganizationInteractor({
            permissionInteractor,
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
            appUserInteractor: new AppUserInteractor({
                permissionInteractor,
                repository: new AppUserRepository({
                    em: event.context.em
                })
            })
        })

    await organizationInteractor.deleteSolutionBySlug(slug).catch(handleDomainException)
})
