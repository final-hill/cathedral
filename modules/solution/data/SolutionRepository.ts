// import type Solution from "../domain/Solution";
// import type { Properties } from "~/domain/Properties";
// import StorageRepository from "~/data/StorageRepository.js";
// import type SlugRepository from "~/application/SlugRepository";
// import SolutionToJsonMapper from "../mappers/SolutionToJsonMapper";

import Repository from "~/application/Repository";
import type Solution from "../domain/Solution";
import type Mapper from "~/application/Mapper";
import { PGliteWorker } from "@electric-sql/pglite/worker";

// export default class SolutionRepository extends StorageRepository<Solution> implements SlugRepository<Solution> {
//     constructor(properties: Properties<Omit<SolutionRepository, 'storageKey' | 'mapper'>> = {}) {
//         super({
//             ...properties,
//             storageKey: 'solutions',
//             mapper: new SolutionToJsonMapper(serializationVersion)
//         })
//     }

//     async getSolutionBySlug(slug: string): Promise<Solution | undefined> {
//         const solutions = await this.getAll(s => s.slug === slug)
//         return solutions[0]
//     }
// }

export default class SolutionRepository extends Repository<Solution> {
    private _connString: string

    constructor({ connString, mapper }: { connString: string, mapper: Mapper<Solution, unknown> }) {
        super({ mapper })
        this._connString = connString
    }

    async getSolutionBySlug(slug: string): Promise<Solution | undefined> {
        const pgLiteClient = new PGliteWorker(this._connString)
        await pgLiteClient.waitReady
    }
}