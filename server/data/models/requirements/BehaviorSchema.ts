import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Behavior, MoscowPriority, Requirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<Behavior, Requirement>({
    class: Behavior,
    extends: RequirementSchema,
    abstract: true,
    properties: {
        priority: { enum: true, items: () => MoscowPriority, nullable: false }
    }
})