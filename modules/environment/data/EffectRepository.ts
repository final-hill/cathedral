import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type Effect from "../domain/Effect";
import EffectToJsonMapper from "../mappers/EffectToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class EffectRepository extends StorageRepository<Effect> {
    constructor(properties: Properties<Omit<EffectRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'effect',
            mapper: new EffectToJsonMapper(serializationVersion)
        })
    }
}