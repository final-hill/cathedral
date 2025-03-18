import { z } from "zod"
import { AppUser, Organization } from "#shared/domain"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository, AppUserRepository } from "~/server/data/repositories";
import { AppUserInteractor } from "~/application/AppUserInteractor";
import handleDomainException from "~/server/utils/handleDomainException";

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    ...AppUser.pick({ email: true, role: true }).required().shape,
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Invite an appuser to an organization with a role
 */
export default defineEventHandler(async (event) => {
    const { email, organizationId, organizationSlug, role } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        appUserInteractor = new AppUserInteractor({
            userId: session.id,
            repository: new AppUserRepository({
                em: event.context.em
            })
        }),
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            repository: new OrganizationRepository({
                em: event.context.em,
                organizationId,
                organizationSlug
            })
        })

    try {
        const orgId = organizationId ?? (await organizationInteractor.getOrganization())!.id,
            appUser = (await appUserInteractor.getAppUserByEmail(email))!

        return await organizationInteractor.addAppUserOrganizationRole({
            appUserId: appUser.id,
            organizationId: orgId,
            role
        })
    } catch (error: any) {
        return handleDomainException(error)
    }
})