import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Requirement, Invariant } from "../../domain/requirements/index.js";

export default new EntitySchema<Invariant, Requirement>({
    class: Invariant,
    extends: RequirementSchema
})