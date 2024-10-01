import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Obstacle, Goal, ParsedRequirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<Obstacle, Goal>({
    class: Obstacle,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true }
    }
})