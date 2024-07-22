import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Requirement from "../../domain/Requirement.js";
import Constraint from "../../domain/Constraint.js";
import ConstraintCategory from "../../domain/ConstraintCategory.js";

export default new EntitySchema<Constraint, Requirement>({
    class: Constraint,
    extends: RequirementSchema,
    properties: {
        category: { enum: true, items: () => ConstraintCategory, nullable: false }
    }
})