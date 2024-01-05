import type { Uuid } from '~/types/Uuid.mjs';
import type { EntityJson } from './EntityToJsonMapper.mjs';
import EntityToJsonMapper from './EntityToJsonMapper.mjs';
import Solution from '~/domain/Solution.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface SolutionJson extends EntityJson {
    name: string;
    description: string;
    project: Uuid;
    environment: Uuid;
    goals: Uuid;
    system: Uuid;
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
            project: source.project,
            environment: source.environment,
            goals: source.goals,
            system: source.system
        };
    }
}