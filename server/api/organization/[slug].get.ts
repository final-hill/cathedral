import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository } from "~/server/data/repositories"
import handleDomainException from "~/server/utils/handleDomainException"
import { Organization } from "~/shared/domain"

const paramSchema = Organization.innerType().pick({ slug: true })

/**
 * Returns an organization by slug
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em: event.context.em, organizationSlug: slug }),
            userId: session.id
        })

    return await organizationInteractor.getOrganization().catch(handleDomainException)
})
