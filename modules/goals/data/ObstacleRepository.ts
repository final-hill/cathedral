import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository.js";
import type Obstacle from "../domain/Obstacle";
import ObstacleToJsonMapper from "../mappers/ObstacleToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class ObstacleRepository extends StorageRepository<Obstacle> {
    constructor(properties: Properties<Omit<ObstacleRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'obstacle',
            mapper: new ObstacleToJsonMapper(serializationVersion)
        })
    }
}