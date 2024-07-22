import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Requirement from "../../domain/Requirement.js";
import Effect from "../../domain/Effect.js";

export default new EntitySchema<Effect, Requirement>({
    class: Effect,
    extends: RequirementSchema
})