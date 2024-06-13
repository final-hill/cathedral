import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type FunctionalRequirement from "../domain/FunctionalRequirement";
import FunctionalRequirementToJsonMapper from "../mappers/FunctionalRequirementToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class FunctionalRequirementRepository extends StorageRepository<FunctionalRequirement> {
    constructor(properties: Properties<Omit<FunctionalRequirementRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'functionalRequirement',
            mapper: new FunctionalRequirementToJsonMapper(serializationVersion)
        })
    }
}