import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Requirement from "../../domain/requirements/Requirement.js";
import Limit from "../../domain/requirements/Limit.js";

export default new EntitySchema<Limit, Requirement>({
    class: Limit,
    extends: RequirementSchema
})