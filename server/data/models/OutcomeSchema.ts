import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Goal from "../../domain/requirements/Goal.js";
import Outcome from "../../domain/requirements/Outcome.js";

export default new EntitySchema<Outcome, Goal>({
    class: Outcome,
    extends: RequirementSchema
})