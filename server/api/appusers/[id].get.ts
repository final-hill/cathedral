import { z } from "zod"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository } from "~/server/data/repositories/OrganizationRepository";
import handleDomainException from "~/server/utils/handleDomainException";
import { AppUser, Organization } from "#shared/domain";

const paramSchema = AppUser.pick({ id: true }),
    { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const querySchema = z.object({
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Returns an appuser by id in a given organization
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            repository: new OrganizationRepository({
                em: event.context.em,
                organizationId,
                organizationSlug
            })
        })

    return await organizationInteractor.getAppUserById(id).catch(handleDomainException)
})