import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Goal, Outcome } from "../../../domain/requirements/index.js";

export default new EntitySchema<Outcome, Goal>({
    class: Outcome,
    extends: RequirementSchema
})