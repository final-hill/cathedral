import { z } from "zod"
import { getServerSession } from '#auth'
import { Requirement } from "~/domain/requirements"
import { OrganizationInteractor } from '~/application'
import { fork } from "~/server/data/orm.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    solutionId: z.string().uuid(),
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional()
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Create an event handler for getting a requirement
 *
 * @param ReqClass The class of the requirement to get
 * @returns The event handler
 */
export default function getRequirementHttpHandler<RCons extends typeof Requirement>(ReqClass: RCons) {
    return defineEventHandler(async (event) => {
        const { id } = await validateEventParams(event, paramSchema),
            { solutionId, organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
            session = (await getServerSession(event))!,
            organizationInteractor = new OrganizationInteractor({
                userId: session.id,
                organizationId,
                organizationSlug,
                entityManager: fork()
            })

        return (await organizationInteractor.getRequirementById({ solutionId, ReqClass, id }))
    })
}