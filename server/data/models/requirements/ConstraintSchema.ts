import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Requirement, Constraint, ConstraintCategory, ParsedRequirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<Constraint, Requirement>({
    class: Constraint,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true },
        category: { enum: true, items: () => ConstraintCategory, nullable: true }
    }
})