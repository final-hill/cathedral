import type Solution from "../domain/Solution";
import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository.js";
import type SlugRepository from "~/application/SlugRepository";
import SolutionToJsonMapper from "../mappers/SolutionToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class SolutionRepository extends StorageRepository<Solution> implements SlugRepository<Solution> {
    constructor(properties: Properties<Omit<SolutionRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'solutions',
            mapper: new SolutionToJsonMapper(serializationVersion)
        })
    }

    async getSolutionBySlug(slug: string): Promise<Solution | undefined> {
        const solutions = await this.getAll(s => s.slug === slug)
        return solutions[0]
    }
}