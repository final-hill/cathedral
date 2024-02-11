import type { EntityJson } from './EntityToJsonMapper.mjs';
import EntityToJsonMapper from './EntityToJsonMapper.mjs';
import { Solution, type Uuid } from '~/domain/index.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface SolutionJson extends EntityJson {
    name: string;
    description: string;
    projectId: Uuid;
    environmentId: Uuid;
    goalsId: Uuid;
    systemId: Uuid;
}

export default class SolutionToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: SolutionJson): Solution {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.4.0'))
            return new Solution(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Solution): SolutionJson {
        return {
            ...super.mapTo(source),
            name: source.name,
            description: source.description,
            projectId: source.projectId,
            environmentId: source.environmentId,
            goalsId: source.goalsId,
            systemId: source.systemId
        };
    }
}