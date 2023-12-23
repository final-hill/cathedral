import UseCase from '~/domain/UseCase.mjs';
import BehaviorToJsonMapper, { type BehaviorJson } from './BehaviorToJsonMapper.mjs';
import type { Uuid } from '~/types/Uuid.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface UseCaseJson extends BehaviorJson {
    actor: Uuid;
}

export default class UseCaseToJsonMapper extends BehaviorToJsonMapper {
    override mapFrom(target: UseCaseJson): UseCase {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.3.0'))
            return new UseCase(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: UseCase): UseCaseJson {
        return {
            ...super.mapTo(source),
            actor: source.actor
        };
    }
}