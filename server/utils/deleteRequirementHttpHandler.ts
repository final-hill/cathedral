import { z } from "zod"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from '~/application'
import { Requirement } from '~/domain/requirements'
import config from '~/mikro-orm.config'
import { OrganizationRepository } from "../data/repositories/OrganizationRepository"
import handleDomainException from "./handleDomainException"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional(),
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Create an event handler for deleting a requirement
 *
 * @param ReqClass The class of the requirement to delete
 * @returns The event handler
 */
export default function deleteRequirementHttpHandler<RCons extends typeof Requirement>(ReqClass: RCons) {
    return defineEventHandler(async (event) => {
        const { id } = await validateEventParams(event, paramSchema),
            { solutionId, organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
            session = (await getServerSession(event))!,
            organizationInteractor = new OrganizationInteractor({
                repository: new OrganizationRepository({ config, organizationId, organizationSlug }),
                userId: session.id
            })

        await organizationInteractor.deleteRequirement({ ReqClass, id, solutionId }).catch(handleDomainException)
    })
}