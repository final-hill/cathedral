import { z } from "zod"
import config from "~/mikro-orm.config"
import { OrganizationCollectionInteractor } from '~/application'
import { OrganizationCollectionRepository } from "~/server/data/repositories"
import { getServerSession } from '#auth'
import handleDomainException from "~/server/utils/handleDomainException"

const querySchema = z.object({})

/**
 * Returns all organizations that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventParams(event, querySchema),
        session = (await getServerSession(event))!,
        orgColInt = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ config }),
            userId: session.id
        })

    return orgColInt.findOrganizations({}).catch(handleDomainException)
})
