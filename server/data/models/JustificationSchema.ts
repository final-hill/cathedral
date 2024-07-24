import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Justification from "../../domain/requirements/Justification.js";
import MetaRequirement from "../../domain/requirements/MetaRequirement.js";

export default new EntitySchema<Justification, MetaRequirement>({
    class: Justification,
    extends: RequirementSchema
})