import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Requirement, Limit, ParsedRequirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<Limit, Requirement>({
    class: Limit,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true }
    }
})