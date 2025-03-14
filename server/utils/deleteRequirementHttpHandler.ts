import { z } from "zod"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from '~/application'
import { OrganizationRepository } from "../data/repositories/OrganizationRepository"
import handleDomainException from "./handleDomainException"
import { ReqType } from "#shared/domain/requirements/ReqType";
import { Organization, Solution } from "~/shared/domain"

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const paramSchema = Organization.innerType().pick({ id: true })

const bodySchema = z.object({
    solutionId: Solution.innerType().pick({ id: true }).shape.id,
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Create an event handler for deleting a requirement
 *
 * @param reqType The type of the requirement to delete
 * @returns The event handler
 */
export default function deleteRequirementHttpHandler(reqType: ReqType) {
    return defineEventHandler(async (event) => {
        const { id } = await validateEventParams(event, paramSchema),
            { solutionId, organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
            session = (await getServerSession(event))!,
            organizationInteractor = new OrganizationInteractor({
                repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
                userId: session.id
            })

        await organizationInteractor.deleteRequirement({ reqType, id, solutionId }).catch(handleDomainException)
    })
}