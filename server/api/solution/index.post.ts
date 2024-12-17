import { getServerSession } from '#auth'
import config from '~/mikro-orm.config';
import { z } from "zod"
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository } from '~/server/data/repositories/OrganizationRepository';

const bodySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string(),
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional(),
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Creates a new solution and returns its slug
 */
export default defineEventHandler(async (event) => {
    const { description, name, organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            repository: new OrganizationRepository({ config, organizationId, organizationSlug })
        }),
        newSolution = await organizationInteractor.addSolution({ name, description })

    return newSolution.slug
})