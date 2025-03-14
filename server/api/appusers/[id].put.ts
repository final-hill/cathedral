import { z } from "zod"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository } from "~/server/data/repositories/OrganizationRepository"
import handleDomainException from "~/server/utils/handleDomainException"
import { AppUser, Organization } from "#shared/domain"

const paramSchema = AppUser.pick({ id: true }),
    { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    organizationId,
    organizationSlug,
    ...AppUser.pick({ role: true }).required().shape
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Update an appuser by id in a given organization to have a new role
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug, role } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            repository: new OrganizationRepository({
                em: event.context.em,
                organizationId,
                organizationSlug
            })
        })

    return await organizationInteractor.updateAppUserRole(id, role).catch(handleDomainException)
})