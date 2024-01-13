import type { Uuid } from '~/types/Uuid.mjs';
import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';
import Environment from '~/domain/Environment.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface EnvironmentJson extends EntityJson {
    glossaryIds: Uuid[];
    constraintIds: Uuid[];
    invariantIds: Uuid[];
    assumptionIds: Uuid[];
    effectIds: Uuid[];
}

export default class EnvironmentToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: EnvironmentJson): Environment {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.3.0'))
            return new Environment({
                ...target,
                constraintIds: target.constraintIds ?? [],
                invariantIds: target.invariantIds ?? [],
                assumptionIds: target.assumptionIds ?? [],
                effectIds: target.effectIds ?? []
            });

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Environment): EnvironmentJson {
        return {
            ...super.mapTo(source),
            glossaryIds: source.glossaryIds,
            constraintIds: source.constraintIds,
            invariantIds: source.invariantIds,
            assumptionIds: source.assumptionIds,
            effectIds: source.effectIds
        };
    }
}