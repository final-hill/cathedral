import { getServerSession } from '#auth'
import * as req from "#shared/domain/requirements";
import { OrganizationInteractor } from '~/application'
import { type ZodObject } from "zod"
import { OrganizationRepository } from '../data/repositories/OrganizationRepository';
import handleDomainException from './handleDomainException'

const { id: organizationId, slug: organizationSlug } = req.Organization.innerType().pick({ id: true, slug: true }).partial().shape

/**
 * Creates an event handler for POST requests that create a new requirement
 *
 * @param props.bodySchema - The schema for the request body
 * @returns The event handler
 */
export default function postRequirementHttpHandler<
    BodySchema extends (ZodObject<any>)
>(bodySchema: BodySchema) {
    const validatedBodySchema = bodySchema.extend({
        solutionSlug: req.Solution.innerType().pick({ slug: true }).shape.slug,
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined;
    }, "At least one of organizationId or organizationSlug should be provided");

    return defineEventHandler(async (event) => {
        // FIXME: Zod sucks at type inference. see: https://github.com/colinhacks/zod/issues/2807
        const { solutionSlug, organizationId, organizationSlug, ...reqProps } = await validateEventBody(event, validatedBodySchema) as any,
            session = (await getServerSession(event))!,
            organizationInteractor = new OrganizationInteractor({
                repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
                userId: session.id
            })

        const newRequirementId = await organizationInteractor.addRequirement({ solutionSlug, reqProps }).catch(handleDomainException)

        return newRequirementId
    })
}