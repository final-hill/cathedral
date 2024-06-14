import ScenarioToJsonMapper, { type ScenarioJson } from "./ScenarioToJsonMapper";
import UseCase from "../domain/UseCase";

export interface UseCaseJson extends ScenarioJson { }

export default class UseCaseToJsonMapper extends ScenarioToJsonMapper {
    override mapFrom(target: UseCaseJson): UseCase {
        return new UseCase(target);
    }

    override mapTo(source: UseCase): UseCaseJson {
        return {
            ...super.mapTo(source)
        };
    }
}