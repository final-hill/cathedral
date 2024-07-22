import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Justification from "../../domain/Justification.js";
import MetaRequirement from "../../domain/MetaRequirement.js";

export default new EntitySchema<Justification, MetaRequirement>({
    class: Justification,
    extends: RequirementSchema
})