import PEGSToJsonMapper, { type PEGSJson } from "~/mappers/PEGSToJsonMapper";
import Goals from "../domain/Goals";
import type { Uuid } from "~/domain/Uuid";

export interface GoalsJson extends PEGSJson {
    goals: Uuid[]
    obstacles: Uuid[]
    outcomes: Uuid[]
    stakeholders: Uuid[]
    useCases: Uuid[]
}

export default class GoalsToJsonMapper extends PEGSToJsonMapper {
    override mapFrom(target: GoalsJson): Goals {
        const pegs = super.mapFrom(target)

        return new Goals({
            id: pegs.id,
            limitationIds: pegs.limitationIds,
            outcomes: target.outcomes,
            solutionId: pegs.solutionId,
            componentIds: pegs.componentIds,
            goals: target.goals,
            obstacles: target.obstacles,
            stakeholders: target.stakeholders,
            useCases: target.useCases
        });
    }

    override mapTo(source: Goals): GoalsJson {
        return {
            ...super.mapTo(source as any),
            goals: source.goals,
            obstacles: source.obstacles,
            outcomes: source.outcomes,
            stakeholders: source.stakeholders,
            useCases: source.useCases
        };
    }
}