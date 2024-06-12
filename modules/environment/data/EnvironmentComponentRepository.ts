import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type EnvironmentComponent from "../domain/EnvironmentComponent";
import EnvironmentComponentToJsonMapper from "../mappers/EnvironmentComponentToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class EnvironmentComponentRepository extends StorageRepository<EnvironmentComponent> {
    constructor(properties: Properties<Omit<EnvironmentComponentRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'environmentComponent',
            mapper: new EnvironmentComponentToJsonMapper(serializationVersion)
        })
    }
}