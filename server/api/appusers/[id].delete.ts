import { z } from 'zod'
import { createOrganizationInteractor } from '~~/server/utils/createOrganizationInteractor'
import { AppUser, Organization } from '#shared/domain'

const paramSchema = AppUser.pick({ id: true }),
    { id: organizationId, slug: organizationSlug } = Organization.pick({ id: true, slug: true }).partial().shape,
    bodySchema = z.object({
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Delete an appuser by id in a given organization
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams({ event, schema: paramSchema }),
        { organizationId, organizationSlug } = await validateEventBody({ event, schema: bodySchema }),
        session = await requireUserSession(event),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationId, organizationSlug })

    return await organizationInteractor.deleteAppUser(id).catch(handleDomainException)
})
