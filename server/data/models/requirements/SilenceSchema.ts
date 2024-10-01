import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Requirement, Silence } from "../../../domain/requirements/index.js";

export default new EntitySchema<Silence, Requirement>({
    class: Silence,
    extends: RequirementSchema
})