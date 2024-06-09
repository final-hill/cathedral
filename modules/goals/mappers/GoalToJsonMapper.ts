import Goal from "../domain/Goal";
import SemVer from "~/domain/SemVer";
import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";

export interface GoalJson extends RequirementJson { }

export default class GoalToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: GoalJson): Goal {
        const version = new SemVer(target.serializationVersion);

        return new Goal(target);
    }

    override mapTo(source: Goal): GoalJson {
        return {
            ...super.mapTo(source),
        };
    }
}