import { z } from "zod"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository } from "~/server/data/repositories/OrganizationRepository";
import handleDomainException from "~/server/utils/handleDomainException";
import { Organization } from "#shared/domain";

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const querySchema = z.object({
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Returns all appusers for the organization with their associated roles
 */
export default defineEventHandler(async (event) => {
    const { organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            repository: new OrganizationRepository({
                em: event.context.em,
                organizationId,
                organizationSlug
            })
        })

    return await organizationInteractor.getOrganizationAppUsers().catch(handleDomainException)
})