import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { MetaRequirement, Requirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<MetaRequirement, Requirement>({
    class: MetaRequirement,
    abstract: true,
    extends: RequirementSchema
})