import Goal from "../domain/Goal";
import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";

export interface GoalJson extends RequirementJson { }

export default class GoalToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: GoalJson): Goal {
        return new Goal(target);
    }

    override mapTo(source: Goal): GoalJson {
        return {
            ...super.mapTo(source),
        };
    }
}