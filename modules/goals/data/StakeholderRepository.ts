import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository.js";
import type Stakeholder from "../domain/Stakeholder";
import StakeholderToJsonMapper from "../mappers/StakeholderToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class StakeholderRepository extends StorageRepository<Stakeholder> {
    constructor(properties: Properties<Omit<StakeholderRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'stakeholder',
            mapper: new StakeholderToJsonMapper(serializationVersion)
        })
    }
}