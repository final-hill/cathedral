import Project from '~/domain/Project.mjs';
import StorageRepository from './StorageRepository.mjs';
import ProjectToJsonMapper from '~/mappers/ProjectToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import type { SemVerString } from '~/lib/SemVer.mjs';

export default class ProjectRepository extends StorageRepository<Project> {
    constructor(storage: Storage) {
        super('projects', storage, new ProjectToJsonMapper(pkg.version as SemVerString));
    }
}