import { PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql"
import { Requirement } from "../../domain/requirements/Requirement.js"
import { Belongs } from "../../domain/relations/index.js"
import { ReqType } from "../../domain/requirements/ReqType.js"
import { type ReqRelModel } from "../../domain/types/index.js"

/**
 *
 * @param req_type - The type of requirement to find
 * @param em - The entity manager
 * @param query - The query parameters
 * @param [populate] - The reference fields to populate
 * @returns
 */
export default async function findAllSolutionRequirements<R extends Requirement>(
    req_type: ReqType,
    em: SqlEntityManager<PostgreSqlDriver>,
    query: Record<string, any> & { solutionId: string, parentComponent?: string },
    populate: string[] = []
): Promise<ReqRelModel<R>[]> {
    const q = Object.entries(query)
        .filter(([key, value]) =>
            value !== undefined && !['solutionId'].includes(key)
        ).reduce((acc, [key, value]) => ({
            ...acc,
            [key.endsWith("Id") ? key.replace(/Id$/, "") : key]: value
        }), {})

    const solutionItems = await em.find(Belongs, {
        left: { req_type, ...q },
        right: query.solutionId
    }, {
        populate: [
            'left',
            ...populate.map(prop => `left.${prop}`) as any[]
        ]
    })

    return solutionItems.map(result =>
        Object.assign(result.left, { solutionId: query.solutionId }) as unknown as ReqRelModel<R>
    )
}