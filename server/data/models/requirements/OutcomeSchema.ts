import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Goal, Outcome, ParsedRequirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<Outcome, Goal>({
    class: Outcome,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true }
    }
})