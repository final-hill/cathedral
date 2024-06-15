import ScenarioToJsonMapper, { type ScenarioJson } from "./ScenarioToJsonMapper";
import UseCase from "../domain/UseCase";
import type { Uuid } from "~/domain/Uuid";

export interface UseCaseJson extends ScenarioJson {
    scope: string
    level: string
    goalInContext: string
    preCondition: Uuid
    trigger: Uuid
    mainSuccessScenario: string
    successGuarantee: Uuid
    extensions: string
    stakeHoldersAndInterests: Uuid[]
}

export default class UseCaseToJsonMapper extends ScenarioToJsonMapper {
    override mapFrom(target: UseCaseJson): UseCase {
        return new UseCase(target);
    }

    override mapTo(source: UseCase): UseCaseJson {
        return {
            ...super.mapTo(source),
            scope: source.scope,
            level: source.level,
            goalInContext: source.goalInContext,
            preCondition: source.preCondition,
            trigger: source.trigger,
            mainSuccessScenario: source.mainSuccessScenario,
            successGuarantee: source.successGuarantee,
            extensions: source.extensions,
            stakeHoldersAndInterests: source.stakeHoldersAndInterests
        };
    }
}