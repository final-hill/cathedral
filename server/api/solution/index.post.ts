import { getServerSession } from '#auth'
import { z } from "zod"
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository } from '~/server/data/repositories/OrganizationRepository';
import handleDomainException from '~/server/utils/handleDomainException';
import { Organization, Solution } from '#shared/domain';

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    ...Solution.innerType().pick({ name: true, description: true }).shape,
    organizationId,
    organizationSlug,
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Creates a new solution and returns its slug
 */
export default defineEventHandler(async (event) => {
    const { description, name, organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug })
        })

    try {
        const newSolutionId = (await organizationInteractor.addSolution({ name, description }))!,
            newSolution = await organizationInteractor.getSolutionById(newSolutionId)
        return newSolution.slug
    } catch (error: any) {
        return handleDomainException(error)
    }
})