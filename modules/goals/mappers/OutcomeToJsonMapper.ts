import Outcome from "../domain/Outcome";
import SemVer from "~/domain/SemVer";
import GoalToJsonMapper, { type GoalJson } from "./GoalToJsonMapper";

export interface OutcomeJson extends GoalJson { }

export default class OutcomeToJsonMapper extends GoalToJsonMapper {
    override mapFrom(target: OutcomeJson): Outcome {
        const version = new SemVer(target.serializationVersion);

        return new Outcome(target);
    }

    override mapTo(source: Outcome): OutcomeJson {
        return {
            ...super.mapTo(source as any)
        };
    }
}