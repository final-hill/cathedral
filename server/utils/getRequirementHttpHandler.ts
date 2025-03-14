import { z } from "zod"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from '~/application'
import { OrganizationRepository } from "../data/repositories/OrganizationRepository"
import handleDomainException from "./handleDomainException"
import { ReqType } from "~/shared/domain/requirements/ReqType";
import { Organization } from "~/shared/domain"

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    solutionId: z.string().uuid(),
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Create an event handler for getting a requirement
 *
 * @param reqType The type of the requirement to get
 * @returns The event handler
 */
export default function getRequirementHttpHandler(reqType: ReqType) {
    return defineEventHandler(async (event) => {
        const { id } = await validateEventParams(event, paramSchema),
            { solutionId, organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
            session = (await getServerSession(event))!,
            organizationInteractor = new OrganizationInteractor({
                repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
                userId: session.id
            })

        return await organizationInteractor.getSolutionRequirementById({ solutionId, reqType, id }).catch(handleDomainException)
    })
}