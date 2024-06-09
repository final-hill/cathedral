import PEGSToJsonMapper, { type PEGSJson } from "~/mappers/PEGSToJsonMapper";
import Environment from "../domain/Environment";
import type { Uuid } from "~/domain/Uuid";

export interface EnvironmentJson extends PEGSJson {
    assumptionIds: Uuid[]
    constraintIds: Uuid[]
    effectIds: Uuid[]
    invariantIds: Uuid[]
    glossaryTermIds: Uuid[]
}

export default class EnvironmentToJsonMapper extends PEGSToJsonMapper {
    override mapFrom(target: EnvironmentJson): Environment {

        return new Environment({
            assumptionIds: target.assumptionIds,
            constraintIds: target.constraintIds,
            effectIds: target.effectIds,
            invariantIds: target.invariantIds,
            componentIds: target.componentIds,
            id: target.id,
            limitationIds: target.limitationIds,
            solutionId: target.solutionId,
            glossaryTermIds: target.glossaryTermIds
        });
    }

    override mapTo(source: Environment): EnvironmentJson {
        return {
            ...super.mapTo(source as any),
            assumptionIds: source.assumptionIds,
            constraintIds: source.constraintIds,
            effectIds: source.effectIds,
            invariantIds: source.invariantIds,
            glossaryTermIds: source.glossaryTermIds
        };
    }
}