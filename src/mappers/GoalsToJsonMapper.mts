import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';
import { Goals } from '~/domain/index.mjs';
import SemVer from '~/lib/SemVer.mjs';
import BehaviorToJsonMapper, { type BehaviorJson } from './BehaviorToJsonMapper.mjs';
import UseCaseToJsonMapper, { type UseCaseJson } from './UseCaseToJsonMapper.mjs';
import StakeholderToJsonMapper, { type StakeholderJson } from './StakeholderToJsonMapper.mjs';
import LimitToJsonMapper, { type LimitJson } from './LimitToJsonMapper.mjs';

export interface GoalsJson extends EntityJson {
    functionalBehaviors: BehaviorJson[];
    objective: string;
    outcomes: string;
    situation: string;
    stakeholders: StakeholderJson[];
    useCases: UseCaseJson[];
    limits: LimitJson[];
}

export default class GoalsToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: GoalsJson): Goals {
        const sVer = target.serializationVersion,
            version = new SemVer(sVer),
            useCaseToJsonMapper = new UseCaseToJsonMapper(sVer),
            limitToJsonMapper = new LimitToJsonMapper(sVer),
            stakeholderToJsonMapper = new StakeholderToJsonMapper(sVer),
            behaviorToJsonMapper = new BehaviorToJsonMapper(sVer);

        if (version.gte('0.3.0'))
            return new Goals({
                ...target,
                functionalBehaviors: (target.functionalBehaviors ?? []).map(item => behaviorToJsonMapper.mapFrom(item)),
                stakeholders: (target.stakeholders ?? []).map(item => stakeholderToJsonMapper.mapFrom(item)),
                useCases: (target.useCases ?? []).map(item => useCaseToJsonMapper.mapFrom(item)),
                limits: (target.limits ?? []).map(item => limitToJsonMapper.mapFrom(item))
            });

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Goals): GoalsJson {
        const sVer = this.serializationVersion,
            useCaseToJsonMapper = new UseCaseToJsonMapper(sVer),
            limitToJsonMapper = new LimitToJsonMapper(sVer),
            stakeholderToJsonMapper = new StakeholderToJsonMapper(sVer),
            behaviorToJsonMapper = new BehaviorToJsonMapper(sVer);

        return {
            ...super.mapTo(source),
            functionalBehaviors: source.functionalBehaviors.map(item => behaviorToJsonMapper.mapTo(item)),
            objective: source.objective,
            outcomes: source.outcomes,
            situation: source.situation,
            stakeholders: source.stakeholders.map(item => stakeholderToJsonMapper.mapTo(item)),
            useCases: source.useCases.map(item => useCaseToJsonMapper.mapTo(item)),
            limits: source.limits.map(item => limitToJsonMapper.mapTo(item))
        };
    }
}