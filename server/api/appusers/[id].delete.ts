import { z } from "zod"
import { getServerSession } from '#auth'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor } from "~/application"
import { AppUserRepository, OrganizationRepository, PermissionRepository } from "~/server/data/repositories";
import handleDomainException from "~/server/utils/handleDomainException";
import { AppUser, Organization } from "#shared/domain";

const paramSchema = AppUser.pick({ id: true }),
    { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Delete an appuser by id in a given organization
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        permissionInteractor = new PermissionInteractor({
            userId: session.id,
            repository: new PermissionRepository({ em: event.context.em })
        }),
        organizationInteractor = new OrganizationInteractor({
            permissionInteractor,
            appUserInteractor: new AppUserInteractor({
                permissionInteractor,
                repository: new AppUserRepository({ em: event.context.em })
            }),
            repository: new OrganizationRepository({
                em: event.context.em,
                organizationId,
                organizationSlug
            })
        })

    return await organizationInteractor.deleteAppUser(id).catch(handleDomainException)
})