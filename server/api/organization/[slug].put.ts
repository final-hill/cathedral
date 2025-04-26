import { getServerSession } from '#auth'
import { OrganizationCollectionInteractor, PermissionInteractor } from "~/application"
import { OrganizationCollectionRepository, PermissionRepository } from "~/server/data/repositories"
import handleDomainException from "~/server/utils/handleDomainException"
import { Organization } from "#shared/domain"

const paramSchema = Organization.innerType().pick({ slug: true }),
    bodySchema = Organization.innerType().pick({ name: true, description: true }).partial()

/**
 * Updates an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        body = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            permissionInteractor: new PermissionInteractor({
                userId: session.id,
                repository: new PermissionRepository({ em: event.context.em })
            })
        })

    return await organizationInteractor.updateOrganizationBySlug(slug, body).catch(handleDomainException)
})