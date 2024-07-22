import { EntitySchema } from "@mikro-orm/core";
import Assumption from "../../domain/Assumption.js";
import Requirement from "../../domain/Requirement.js";
import RequirementSchema from "./RequirementSchema.js";

export default new EntitySchema<Assumption, Requirement>({
    class: Assumption,
    extends: RequirementSchema
})