import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Requirement, Invariant, ParsedRequirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<Invariant, Requirement>({
    class: Invariant,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true }
    }
})