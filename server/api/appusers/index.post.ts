import { z } from "zod"
import { getServerSession } from '#auth'
import { AppRole, } from "~/domain/application/index.js"
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository } from "~/server/data/repositories/OrganizationRepository";
import config from "~/mikro-orm.config";
import { AppUserInteractor } from "~/application/AppUserInteractor";
import { AppUserRepository } from "~/server/data/repositories/AppUserRepository";
import handleDomainException from "~/server/utils/handleDomainException";

const bodySchema = z.object({
    email: z.string(),
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional(),
    role: z.nativeEnum(AppRole)
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
                config
            })
        }),
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            repository: new OrganizationRepository({
                config: config,
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