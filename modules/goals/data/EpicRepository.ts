import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository.js";
import type Epic from "../domain/Epic";
import EpicToJsonMapper from "../mappers/EpicToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class EpicRepository extends StorageRepository<Epic> {
    constructor(properties: Properties<Omit<EpicRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'epic',
            mapper: new EpicToJsonMapper(serializationVersion)
        })
    }
}