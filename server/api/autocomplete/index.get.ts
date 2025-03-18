import { z } from "zod";
import { getServerSession } from '#auth'
import handleDomainException from "~/server/utils/handleDomainException"
import { OrganizationInteractor } from "~/application";
import { OrganizationRepository } from "~/server/data/repositories";
import { ReqType } from "#shared/domain/requirements/ReqType";
import { Organization, Solution } from "#shared/domain";

const querySchema = z.object({
    solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
    organizationSlug: Organization.innerType().pick({ slug: true }).shape.slug,
    reqType: z.nativeEnum(ReqType)
})

export default defineEventHandler(async (event) => {
    const { solutionSlug, organizationSlug, reqType } = await validateEventQuery(event, querySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em: event.context.em, organizationSlug }),
            userId: session.id
        })

    return await organizationInteractor.findSolutionRequirements({
        solutionSlug,
        query: { reqType }
    }).then(requirements => requirements.map(req => ({ label: req.name, value: req.id })))
        .catch(handleDomainException)
})