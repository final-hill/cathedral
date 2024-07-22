import { EntitySchema } from "@mikro-orm/core";
import Behavior from "../../domain/Behavior.js";
import MoscowPriority from "../../domain/MoscowPriority.js";
import Requirement from "../../domain/Requirement.js";
import RequirementSchema from "./RequirementSchema.js";

export default new EntitySchema<Behavior, Requirement>({
    class: Behavior,
    extends: RequirementSchema,
    abstract: true,
    properties: {
        priority: { enum: true, items: () => MoscowPriority }
    }
})