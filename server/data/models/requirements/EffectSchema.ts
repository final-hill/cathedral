import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Requirement, Effect, ParsedRequirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<Effect, Requirement>({
    class: Effect,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true }
    }
})