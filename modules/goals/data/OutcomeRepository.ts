import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository.js";
import type Outcome from "../domain/Outcome";
import OutcomeToJsonMapper from "../mappers/OutcomeToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class OutcomeRepository extends StorageRepository<Outcome> {
    constructor(properties: Properties<Omit<OutcomeRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'outcome',
            mapper: new OutcomeToJsonMapper(serializationVersion)
        })
    }
}