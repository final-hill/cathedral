import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Assumption from "../../domain/requirements/Assumption.js";
import Requirement from "../../domain/requirements/Requirement.js";

export default new EntitySchema<Assumption, Requirement>({
    class: Assumption,
    extends: RequirementSchema
})