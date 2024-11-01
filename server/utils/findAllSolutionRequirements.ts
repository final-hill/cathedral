import { PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql"
import { Requirement } from "../../domain/requirements/Requirement.js"
import { Belongs } from "../../domain/relations/index.js"
import { ReqType } from "../../domain/requirements/ReqType.js"
import { type ReqRelModel } from "../../domain/types/index.js"

/**
 * Find all requirements associated with a solution
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
        Object.assign(result.left, {
            solutionId: query.solutionId
        }) as unknown as ReqRelModel<R>
    )
        // Sort by reqId ascending
        // reqId could be null or a string of the form: X.#.# where X is a letter and # is a number.
        // If reqId is null, it should be treated as the string 'X.0.0'
        // Dictionary sorting willwork for this if each number is zero-padded to a fixed length
        .sort((a, b) => {
            let [aLetter, aMajor, aMinor] = (a.reqId ?? '0.0.0').split('.'),
                [bLetter, bMajor, bMinor] = (b.reqId ?? '0.0.0').split('.'),
                majorLength = Math.max(aMajor.length, bMajor.length),
                minorLength = Math.max(aMinor.length, bMinor.length)

            aMajor = aMajor.padStart(majorLength, '0')
            bMajor = bMajor.padStart(majorLength, '0')
            aMinor = aMinor.padStart(minorLength, '0')
            bMinor = bMinor.padStart(minorLength, '0')

            const aId = `${aLetter}.${aMajor}.${aMinor}`,
                bId = `${bLetter}.${bMajor}.${bMinor}`

            return aId.localeCompare(bId)
        })
}