import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type Assumption from "../domain/Assumption";
import AssumptionToJsonMapper from "../mappers/AssumptionToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class AssumptionRepository extends StorageRepository<Assumption> {
    constructor(properties: Properties<Omit<AssumptionRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'assumption',
            mapper: new AssumptionToJsonMapper(serializationVersion)
        })
    }
}