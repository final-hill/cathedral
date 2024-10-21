import { PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql"
import { Requirement } from "../domain/requirements/Requirement.js"
import { Belongs } from "../domain/relations/index.js"
import { ReqType } from "../domain/requirements/ReqType.js"

export default async function findAllSolutionRequirements<R extends Requirement>(
    req_type: ReqType,
    em: SqlEntityManager<PostgreSqlDriver>,
    query: Record<string, any> & { solutionId: string }
): Promise<R[]> {
    const results = await em.find(Belongs, {
        left: {
            req_type,
            ...Object.entries(query)
                .filter(([key, value]) => value !== undefined && key !== "solutionId")
                .reduce((acc, [key, value]) => ({
                    ...acc,
                    [key.endsWith("Id") ? key.replace(/Id$/, "") : key]: value
                }), {})
        },
        right: query.solutionId
    }, { populate: ['left'] })

    return results.map(result => result.left as unknown as R)
}