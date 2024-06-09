import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type Invariant from "../domain/Invariant";
import InvariantToJsonMapper from "../mappers/InvariantToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class InvariantRepository extends StorageRepository<Invariant> {
    constructor(properties: Properties<Omit<InvariantRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'invariant',
            mapper: new InvariantToJsonMapper(serializationVersion)
        })
    }
}