import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type GlossaryTerm from "../domain/GlossaryTerm";
import GlossaryTermToJsonMapper from "../mappers/GlossaryTermToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class GlossaryTermRepository extends StorageRepository<GlossaryTerm> {
    constructor(properties: Properties<Omit<GlossaryTermRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'glossaryTerm',
            mapper: new GlossaryTermToJsonMapper(serializationVersion)
        })
    }
}