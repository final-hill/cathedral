import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Requirement from "../../domain/requirements/Requirement.js";
import Invariant from "../../domain/requirements/Invariant.js";

export default new EntitySchema<Invariant, Requirement>({
    class: Invariant,
    extends: RequirementSchema
})