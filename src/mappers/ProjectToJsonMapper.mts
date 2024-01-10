import Project from '~/domain/Project.mjs';
import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface ProjectJson extends EntityJson { }

export default class ProjectToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: ProjectJson): Project {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.3.0'))
            return new Project(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Project): ProjectJson {
        return super.mapTo(source);
    }
}