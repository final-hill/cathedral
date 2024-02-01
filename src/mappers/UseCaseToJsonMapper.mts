import UseCase from '~/domain/UseCase.mjs';
import BehaviorToJsonMapper, { type BehaviorJson } from './BehaviorToJsonMapper.mjs';
import StakeholderToJsonMapper, { type StakeholderJson } from './StakeholderToJsonMapper.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface UseCaseJson extends BehaviorJson {
    actor: StakeholderJson;
}

export default class UseCaseToJsonMapper extends BehaviorToJsonMapper {
    override mapFrom(target: UseCaseJson): UseCase {
        const sVer = target.serializationVersion,
            version = new SemVer(sVer),
            stakeholderToJsonMapper = new StakeholderToJsonMapper(sVer);

        if (version.gte('0.5.0'))
            return new UseCase({
                ...target,
                actor: stakeholderToJsonMapper.mapFrom(target.actor)
            });

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: UseCase): UseCaseJson {
        const sVer = this.serializationVersion,
            stakeholderToJsonMapper = new StakeholderToJsonMapper(sVer);

        return {
            ...super.mapTo(source),
            actor: stakeholderToJsonMapper.mapTo(source.actor)
        };
    }
}