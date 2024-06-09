import type { Properties } from "~/domain/Properties";
import EnvironmentToJsonMapper from "../mappers/EnvironmentToJsonMapper";
import StorageRepository from "~/data/StorageRepository";
import type Environment from "../domain/Environment";

const { serializationVersion } = useAppConfig()

export default class EnvironmentRepository extends StorageRepository<Environment> {
    constructor(properties: Properties<Omit<EnvironmentRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'environment',
            mapper: new EnvironmentToJsonMapper(serializationVersion)
        })
    }
}