import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository";
import type UseCase from "~/domain/UseCase";
import UseCaseToJsonMapper from "~/mappers/UseCaseToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class UseCaseRepository extends StorageRepository<UseCase> {
    constructor(properties: Properties<Omit<UseCaseRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'useCase',
            mapper: new UseCaseToJsonMapper(serializationVersion)
        })
    }
}