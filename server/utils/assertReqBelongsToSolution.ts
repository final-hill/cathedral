import { PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql"
import { Requirement, Solution } from "../../domain/requirements";
import { Belongs } from "../../domain/relations";

export default async function assertReqBelongsToSolution<R extends typeof Requirement>(
    em: SqlEntityManager<PostgreSqlDriver>,
    Entity: R,
    reqId: string,
    solution: Solution
): Promise<InstanceType<R>> {
    const belongs = await em.findOne(Belongs, {
        left: em.getReference(Entity, reqId),
        right: solution
    }, { populate: ['left'] })

    if (!belongs)
        throw createError({
            statusCode: 404,
            statusMessage: `The requirement with the given id does not belong to the solution with the given id`
        });

    return belongs.left as unknown as InstanceType<R>
}