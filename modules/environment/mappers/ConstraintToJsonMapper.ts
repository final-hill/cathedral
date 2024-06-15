import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";
import Constraint, { type ConstraintCategory } from "../domain/Constraint";

export interface ConstraintJson extends RequirementJson {
    category: ConstraintCategory;
}

export default class ConstraintToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: ConstraintJson): Constraint {
        return new Constraint({ ...target });
    }

    override mapTo(source: Constraint): ConstraintJson {
        return {
            ...super.mapTo(source),
            category: source.category
        };
    }
}