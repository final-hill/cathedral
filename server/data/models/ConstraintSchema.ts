import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Requirement, Constraint, ConstraintCategory } from "../../domain/requirements/index.js";

export default new EntitySchema<Constraint, Requirement>({
    class: Constraint,
    extends: RequirementSchema,
    properties: {
        category: { enum: true, items: () => ConstraintCategory, nullable: false }
    }
})