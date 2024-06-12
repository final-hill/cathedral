import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository.js";
import type Person from "../domain/Person";
import PersonToJsonMapper from "../mappers/PersonToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class PersonRepository extends StorageRepository<Person> {
    constructor(properties: Properties<Omit<PersonRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'person',
            mapper: new PersonToJsonMapper(serializationVersion)
        })
    }
}