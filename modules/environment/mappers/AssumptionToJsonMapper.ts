import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";
import Assumption from "../domain/Assumption";

export interface AssumptionJson extends RequirementJson { }

export default class AssumptionToJsonMapper extends RequirementToJsonMapper {
    override mapTo(source: Assumption): AssumptionJson {
        return {
            ...super.mapTo(source)
        };
    }

    override mapFrom(target: AssumptionJson): Assumption {
        return new Assumption({
            ...super.mapFrom(target),
        });
    }
}