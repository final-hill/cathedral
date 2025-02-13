import { z } from "zod"
import config from "~/mikro-orm.config"
import { AppUserInteractor, OrganizationInteractor } from '~/application'
import { AppUserRepository, OrganizationRepository } from "~/server/data/repositories"
import { getServerSession } from '#auth'
import handleDomainException from "~/server/utils/handleDomainException"

const querySchema = z.object({})

/**
 * Returns all organizations that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventParams(event, querySchema),
        session = (await getServerSession(event))!,
        appUserInteractor = new AppUserInteractor({
            repository: new AppUserRepository({ config }),
            userId: session.id
        })

    const orgIds = await appUserInteractor.getUserOrganizationIds(session.id),
        orgs = await Promise.all(orgIds.map(id => {
            return (new OrganizationInteractor({
                repository: new OrganizationRepository({
                    config,
                    organizationId: id
                }),
                userId: session.id
            })).getOrganization().catch(handleDomainException)
        }))

    return orgs
})
