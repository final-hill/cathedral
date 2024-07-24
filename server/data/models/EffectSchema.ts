import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Requirement from "../../domain/requirements/Requirement.js";
import Effect from "../../domain/requirements/Effect.js";

export default new EntitySchema<Effect, Requirement>({
    class: Effect,
    extends: RequirementSchema
})