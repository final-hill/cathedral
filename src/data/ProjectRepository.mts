import Project from '~/domain/Project.mjs';
import { PEGSRepository } from './PEGSRepository.mjs';
import ProjectToJsonMapper from '~/mappers/ProjectToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export class ProjectRepository extends PEGSRepository<Project> {
    constructor() { super('projects', new ProjectToJsonMapper(pkg.version)); }
}