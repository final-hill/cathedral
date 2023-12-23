import Project from '~/domain/Project.mjs';
import PEGSRepository from './PEGSRepository.mjs';
import ProjectToJsonMapper from '~/mappers/ProjectToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import type { SemVerString } from '~/lib/SemVer.mjs';

export default class ProjectRepository extends PEGSRepository<Project> {
    constructor(storage: Storage) {
        super('projects', storage, new ProjectToJsonMapper(pkg.version as SemVerString));
    }
}