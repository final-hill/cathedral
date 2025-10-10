import { Organization } from '#shared/domain'

const paramSchema = Organization.innerType().pick({ slug: true })

/**
 * Returns an organization by slug
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        session = await requireUserSession(event),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationSlug: slug })

    return await organizationInteractor.getOrganization().catch(handleDomainException)
})
