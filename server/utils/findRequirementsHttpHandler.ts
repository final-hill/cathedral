import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"
import { type ZodObject } from "zod"
import { OrganizationRepository } from '../data/repositories/OrganizationRepository'
import handleDomainException from './handleDomainException'
import { Organization, Solution } from '~/shared/domain'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

export default function findRequirementsHttpHandler<
    QuerySchema extends ZodObject<any>
>(querySchema: QuerySchema) {
    const validatedQuerySchema = querySchema.extend({
        solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined;
    }, "At least one of organizationId or organizationSlug should be provided");

    return defineEventHandler(async (event) => {
        // FIXME: Zod sucks at type inference. see: https://github.com/colinhacks/zod/issues/2807
        const { solutionSlug, organizationId, organizationSlug, ...query } = await validateEventQuery(event, validatedQuerySchema) as any,
            session = (await getServerSession(event))!,
            organizationInteractor = new OrganizationInteractor({
                repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
                userId: session.id
            })

        return await organizationInteractor.findSolutionRequirements({ solutionSlug, query }).catch(handleDomainException)
    })
}