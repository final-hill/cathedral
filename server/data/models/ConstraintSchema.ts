import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Requirement from "../../domain/requirements/Requirement.js";
import Constraint from "../../domain/requirements/Constraint.js";
import ConstraintCategory from "../../domain/requirements/ConstraintCategory.js";

export default new EntitySchema<Constraint, Requirement>({
    class: Constraint,
    extends: RequirementSchema,
    properties: {
        category: { enum: true, items: () => ConstraintCategory, nullable: false }
    }
})