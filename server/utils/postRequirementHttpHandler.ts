import { getServerSession } from '#auth'
import { Requirement } from "~/domain/requirements"
import { OrganizationInteractor } from '~/application'
import config from "~/mikro-orm.config"
import { z, type ZodObject } from "zod"
import { OrganizationRepository } from '../data/repositories/OrganizationRepository';
import handleDomainException from './handleDomainException'

/**
 * Creates an event handler for POST requests that create a new requirement
 *
 * @param props.ReqClass - The class of the requirement to be created
 * @param props.bodySchema - The schema for the request body
 * @returns The event handler
 */
export default function postRequirementHttpHandler<
    RCons extends typeof Requirement,
    B extends (ZodObject<any>)
>({ ReqClass, bodySchema }: { ReqClass: RCons, bodySchema: B }) {
    const validatedBodySchema = bodySchema.extend({
        solutionId: z.string().uuid(),
        organizationId: z.string().uuid().optional(),
        organizationSlug: z.string().max(100).optional()
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined;
    }, "At least one of organizationId or organizationSlug should be provided");

    return defineEventHandler(async (event) => {
        // FIXME: Zod sucks at type inference. see: https://github.com/colinhacks/zod/issues/2807
        const { solutionId, organizationId, organizationSlug, ...reqProps } = await validateEventBody(event, validatedBodySchema) as any,
            session = (await getServerSession(event))!,
            organizationInteractor = new OrganizationInteractor({
                repository: new OrganizationRepository({ config, organizationId, organizationSlug }),
                userId: session.id
            })

        const newRequirementId = await organizationInteractor.addRequirement({ ReqClass, solutionId, reqProps }).catch(handleDomainException)

        return newRequirementId
    })
}