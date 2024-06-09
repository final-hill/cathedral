import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type Goal from "../domain/Goal";
import LimitToJsonMapper from "../mappers/LimitToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class LimitRepository extends StorageRepository<Goal> {
    constructor(properties: Properties<Omit<LimitRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'limit',
            mapper: new LimitToJsonMapper(serializationVersion)
        })
    }
}