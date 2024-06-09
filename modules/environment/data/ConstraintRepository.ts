import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type Constraint from "../domain/Constraint";
import ConstraintToJsonMapper from "../mappers/ConstraintToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class ConstraintRepository extends StorageRepository<Constraint> {
    constructor(properties: Properties<Omit<ConstraintRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'constraint',
            mapper: new ConstraintToJsonMapper(serializationVersion)
        })
    }
}