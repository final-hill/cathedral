import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from "~/application"
import { AppUserRepository, OrganizationRepository, PermissionRepository, RequirementRepository } from '~/server/data/repositories'
import { Organization, ReqType, Solution } from '~/shared/domain'
import { z } from 'zod'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const paramSchema = z.object({
    reqType: z.nativeEnum(ReqType),
    id: z.string().uuid()
})

export default defineEventHandler(async (event) => {
    const { id, reqType } = await validateEventParams(event, paramSchema);

    if (reqType === ReqType.PARSED_REQUIREMENTS)
        throw createError({ statusCode: 400, message: "PARSED_REQUIREMENTS is not a valid reqType for this operation." });

    const bodySchema = z.object({
        solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined;
    }, "At least one of organizationId or organizationSlug should be provided"),
        { solutionSlug, organizationId: orgId, organizationSlug: orgSlug } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        permissionInteractor = new PermissionInteractor({
            userId: session.user.id,
            repository: new PermissionRepository({ em: event.context.em })
        }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({
                em: event.context.em,
                organizationId: orgId,
                organizationSlug: orgSlug
            }),
            permissionInteractor,
            appUserInteractor: new AppUserInteractor({
                permissionInteractor,
                repository: new AppUserRepository({ em: event.context.em })
            })
        }),
        org = await organizationInteractor.getOrganization(),
        solution = await organizationInteractor.getSolutionBySlug(solutionSlug),
        requirementInteractor = new RequirementInteractor({
            repository: new RequirementRepository({ em: event.context.em }),
            permissionInteractor,
            organizationId: org.id,
            solutionId: solution.id
        })

    return requirementInteractor.editActiveRequirement(id)
        .catch(handleDomainException)
})
