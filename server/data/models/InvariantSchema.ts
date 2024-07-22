import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Requirement from "../../domain/Requirement.js";
import Invariant from "../../domain/Invariant.js";

export default new EntitySchema<Invariant, Requirement>({
    class: Invariant,
    extends: RequirementSchema
})