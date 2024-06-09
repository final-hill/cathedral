import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type Component from "~/domain/Component";
import ComponentToJsonMapper from "~/mappers/ComponentToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class ComponentRepository extends StorageRepository<Component> {
    constructor(properties: Properties<Omit<ComponentRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'component',
            mapper: new ComponentToJsonMapper(serializationVersion)
        })
    }
}