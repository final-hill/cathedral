import type Goals from "../domain/Goals";
import type { Properties } from "~/domain/Properties";
import GoalsToJsonMapper from "../mappers/GoalsToJsonMapper";
import StorageRepository from "~/data/StorageRepository.js";

const { serializationVersion } = useAppConfig()

export default class GoalsRepository extends StorageRepository<Goals> {
    constructor(properties: Properties<Omit<GoalsRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'goals',
            mapper: new GoalsToJsonMapper(serializationVersion)
        })
    }
}