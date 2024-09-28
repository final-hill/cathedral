import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Requirement, Effect } from "../../../domain/requirements/index.js";

export default new EntitySchema<Effect, Requirement>({
    class: Effect,
    extends: RequirementSchema
})