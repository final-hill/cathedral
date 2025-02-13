import { getServerSession } from '#auth'
import { Requirement } from "~/domain/requirements"
import { OrganizationInteractor } from '~/application'
import config from "~/mikro-orm.config"
import { z, type ZodObject } from "zod"
import { OrganizationRepository } from '../data/repositories/OrganizationRepository'
import handleDomainException from './handleDomainException'

/**
 * Creates an event handler for PUT requests that update an existing requirement
 *
 * @param props.ReqClass - The class of the requirement to be updated
 * @param props.bodySchema - The schema for the request body
 * @returns The event handler
 */
export default function putRequirementHttpHandler<
    RCons extends typeof Requirement,
    B extends (ZodObject<any>)
>({ ReqClass, bodySchema }: { ReqClass: RCons, bodySchema: B }) {
    const paramSchema = z.object({
        id: z.string().uuid()
    })

    // FIXME: Zod sucks at type inference. see: https://github.com/colinhacks/zod/issues/2807
    // Omit<InstanceType<RCons>, 'reqId' | 'lastModified' | 'modifiedBy' | 'createdBy'> & { solutionId: string }
    const validatedBodySchema = bodySchema
        .omit({ reqId: true, lastModified: true, modifiedBy: true, createdBy: true })
        .extend({
            solutionId: z.string().uuid(),
            organizationId: z.string().uuid().optional(),
            organizationSlug: z.string().max(100).optional()
        }).refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined;
        }, "At least one of organizationId or organizationSlug should be provided");

    return defineEventHandler(async (event) => {
        const { id } = await validateEventParams(event, paramSchema),
            // FIXME: Zod sucks at type inference. see: https://github.com/colinhacks/zod/issues/2807
            { solutionId, organizationId, organizationSlug, ...reqProps } = await validateEventBody(event, validatedBodySchema) as any,
            session = (await getServerSession(event))!,
            organizationInteractor = new OrganizationInteractor({
                repository: new OrganizationRepository({ config, organizationId, organizationSlug }),
                userId: session.id
            })

        await organizationInteractor.updateSolutionRequirement({ ReqClass, id, solutionId, reqProps }).catch(handleDomainException)
    })
}