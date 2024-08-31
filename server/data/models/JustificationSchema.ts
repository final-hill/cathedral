import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Justification, MetaRequirement } from "../../domain/requirements/index.js";

export default new EntitySchema<Justification, MetaRequirement>({
    class: Justification,
    extends: RequirementSchema
})