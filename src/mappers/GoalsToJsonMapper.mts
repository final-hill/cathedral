import type { Uuid } from '~/types/Uuid.mjs';
import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';
import Goals from '~/domain/Goals.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface GoalsJson extends EntityJson {
    functionalBehaviorIds: Uuid[];
    objective: string;
    outcomes: string;
    situation: string;
    stakeholderIds: Uuid[];
    useCaseIds: Uuid[];
    limitIds: Uuid[];
}

export default class GoalsToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: GoalsJson): Goals {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.3.0'))
            return new Goals({
                ...target,
                useCaseIds: target.useCaseIds ?? [],
                limitIds: target.limitIds ?? []
            });

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Goals): GoalsJson {
        return {
            ...super.mapTo(source),
            functionalBehaviorIds: source.functionalBehaviorIds,
            objective: source.objective,
            outcomes: source.outcomes,
            situation: source.situation,
            stakeholderIds: source.stakeholderIds,
            useCaseIds: source.useCaseIds,
            limitIds: source.limitIds
        };
    }
}