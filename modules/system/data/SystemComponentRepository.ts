import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type SystemComponent from "../domain/SystemComponent";
import SystemComponentToJsonMapper from "../mappers/SystemComponentToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class SystemComponentRepository extends StorageRepository<SystemComponent> {
    constructor(properties: Properties<Omit<SystemComponentRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'component',
            mapper: new SystemComponentToJsonMapper(serializationVersion)
        })
    }
}