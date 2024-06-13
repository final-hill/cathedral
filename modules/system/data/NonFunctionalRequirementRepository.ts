import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import FunctionalRequirementToJsonMapper from "../mappers/FunctionalRequirementToJsonMapper";
import type NonFunctionalRequirement from "../domain/NonFunctionalRequirement";

const { serializationVersion } = useAppConfig()

export default class NonFunctionalRequirementRepository extends StorageRepository<NonFunctionalRequirement> {
    constructor(properties: Properties<Omit<NonFunctionalRequirementRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'nonFunctionalRequirement',
            mapper: new FunctionalRequirementToJsonMapper(serializationVersion)
        })
    }
}