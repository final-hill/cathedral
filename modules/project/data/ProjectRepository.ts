import type Project from "../domain/Project";
import type { Properties } from "~/domain/Properties";
import StorageRepository from "~/data/StorageRepository.js";
import ProjectToJsonMapper from "../mappers/ProjectToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class ProjectRepository extends StorageRepository<Project> {
    constructor(properties: Properties<Omit<ProjectRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'project',
            mapper: new ProjectToJsonMapper(serializationVersion)
        })
    }
}