import Project from '~/domain/Project.mjs';
import PEGSToJsonMapper, { type PEGSJson } from './PEGSToJsonMapper.mjs';

export interface ProjectJson extends PEGSJson { }

export default class ProjectToJsonMapper extends PEGSToJsonMapper {
    override mapFrom(target: ProjectJson): Project {
        const version = target.serializationVersion ?? '{undefined}';

        if (version.startsWith('0.3.'))
            return new Project(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Project): ProjectJson {
        return super.mapTo(source);
    }
}