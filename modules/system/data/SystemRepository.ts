import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type System from "../domain/System";
import SystemToJsonMapper from "../mappers/SystemToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class SystemRepository extends StorageRepository<System> {
    constructor(properties: Properties<Omit<SystemRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'system',
            mapper: new SystemToJsonMapper(serializationVersion)
        })
    }
}