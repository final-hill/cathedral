import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";
import Constraint, { type ConstraintCategory } from "../domain/Constraint";

export interface ConstraintJson extends RequirementJson {
    category: ConstraintCategory;
}

export default class ConstraintToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: ConstraintJson): Constraint {
        return new Constraint({
            category: target.category,
            id: target.id,
            name: target.name,
            parentId: target.parentId,
            property: target.property,
            statement: target.statement,
        });
    }

    override mapTo(source: Constraint): ConstraintJson {
        return {
            ...super.mapTo(source),
            category: source.category
        };
    }
}