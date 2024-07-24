import { EntitySchema } from "@mikro-orm/core";
import Behavior from "../../domain/requirements/Behavior.js";
import MoscowPriority from "../../domain/requirements/MoscowPriority.js";
import Requirement from "../../domain/requirements/Requirement.js";
import RequirementSchema from "./RequirementSchema.js";

export default new EntitySchema<Behavior, Requirement>({
    class: Behavior,
    extends: RequirementSchema,
    abstract: true,
    properties: {
        priority: { enum: true, items: () => MoscowPriority }
    }
})