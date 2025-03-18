import { getServerSession } from '#auth'
import { OrganizationCollectionInteractor } from "~/application"
import { OrganizationCollectionRepository } from "~/server/data/repositories"
import handleDomainException from "~/server/utils/handleDomainException"
import { Organization } from "#shared/domain"

const paramSchema = Organization.innerType().pick({ slug: true })

/**
 * Delete an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationCollectionInteractor({
            userId: session.id,
            repository: new OrganizationCollectionRepository({ em: event.context.em })
        })

    return await organizationInteractor.deleteOrganizationBySlug(slug).catch(handleDomainException)
})
