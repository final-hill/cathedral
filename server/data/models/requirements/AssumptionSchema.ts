import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Assumption, ParsedRequirement, Requirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<Assumption, Requirement>({
    class: Assumption,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true }
    }
})