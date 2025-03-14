import { getServerSession } from '#auth'
import * as req from "#shared/domain/requirements";
import { OrganizationInteractor } from '~/application'
import { z, ZodObject } from "zod"
import { OrganizationRepository } from '../data/repositories/OrganizationRepository'
import handleDomainException from './handleDomainException'

const { id: organizationId, slug: organizationSlug } = req.Organization.innerType().pick({ id: true, slug: true }).partial().shape

/**
 * Creates an event handler for PUT requests that update an existing requirement
 *
  * @param props.bodySchema - The schema for the request body
 * @returns The event handler
 */
export default function putRequirementHttpHandler<
    BodyType extends ZodObject<any, any, any>
>(bodySchema: BodyType) {
    const paramSchema = z.object({
        id: z.string().uuid()
    })

    const validatedBodySchema = bodySchema
        .omit({ reqId: true, lastModified: true, modifiedBy: true, createdBy: true })
        .extend({
            solutionId: z.string().uuid(),
            organizationId,
            organizationSlug
        }).refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined;
        }, "At least one of organizationId or organizationSlug should be provided");

    return defineEventHandler(async (event) => {
        const { id } = await validateEventParams(event, paramSchema),
            // FIXME: Zod sucks at type inference. see: https://github.com/colinhacks/zod/issues/2807
            { solutionId, organizationId, organizationSlug, ...reqProps } = await validateEventBody(event, validatedBodySchema) as any,
            session = (await getServerSession(event))!,
            organizationInteractor = new OrganizationInteractor({
                repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
                userId: session.id
            })

        await organizationInteractor.updateSolutionRequirement({ id, solutionId, reqProps }).catch(handleDomainException)
    })
}