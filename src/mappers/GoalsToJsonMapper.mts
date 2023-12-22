import type { Uuid } from '~/types/Uuid.mjs';
import PEGSToJsonMapper, { type PEGSJson } from './PEGSToJsonMapper.mjs';
import Goals from '~/domain/Goals.mjs';

export interface GoalsJson extends PEGSJson {
    functionalBehaviors: Uuid[];
    objective: string;
    outcomes: string;
    situation: string;
    stakeholders: Uuid[];
    useCases: Uuid[];
    limits: Uuid[];
}

export default class GoalsToJsonMapper extends PEGSToJsonMapper {
    override mapFrom(target: GoalsJson): Goals {
        const version = target.serializationVersion ?? '{undefined}';

        if (version.startsWith('0.3.'))
            return new Goals({
                ...target,
                useCases: target.useCases ?? [],
                limits: target.limits ?? []
            });

        throw new Error(`Unsupported serialization version: ${version}`);
    }
    override mapTo(source: Goals): GoalsJson {
        return {
            ...super.mapTo(source),
            functionalBehaviors: source.functionalBehaviors,
            objective: source.objective,
            outcomes: source.outcomes,
            situation: source.situation,
            stakeholders: source.stakeholders,
            useCases: source.useCases,
            limits: source.limits
        };
    }
}