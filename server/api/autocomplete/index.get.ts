import { z } from 'zod'
import { ReqType } from '#shared/domain/requirements/ReqType'
import { Organization, Solution } from '#shared/domain'

const querySchema = z.object({
    solutionSlug: Solution.pick({ slug: true }).shape.slug,
    organizationSlug: Organization.pick({ slug: true }).shape.slug,
    reqType: z.enum(ReqType).optional(),
    entityType: z.literal('app_user').optional()
}).refine((data) => {
    return data.reqType !== undefined || data.entityType !== undefined
}, 'Either reqType or entityType must be provided')

export default defineEventHandler(async (event) => {
    const { solutionSlug, organizationSlug, reqType, entityType } = await validateEventQuery({ event, schema: querySchema }),
        session = await requireUserSession(event)

    // Handle app_user entity type separately
    if (entityType === 'app_user') {
        // Get AppUsers directly from the organization
        const organizationInteractor = createOrganizationInteractor({ event, session, organizationSlug }),
            appUsers = await organizationInteractor.getAppUsers()
                .catch(handleDomainException)

        // Convert to autocomplete format
        return appUsers.map(appUser => ({
            label: `${appUser.name}`,
            value: {
                id: appUser.id,
                name: appUser.name,
                entityType: 'app_user' as const
            }
        }))
    }

    // Handle regular requirement types
    if (!reqType)
        throw new Error('reqType is required for requirement autocomplete')

    const requirementInteractor = await createRequirementInteractor({ event, session, organizationSlug, solutionSlug })

    return await requirementInteractor.getVisibleRequirementReferences(reqType)
        .then((references) => {
            return references.map(ref => ({
                label: `${ref.name} (${ref.workflowState})`,
                value: ref
            }))
        })
        .catch(handleDomainException)
})
