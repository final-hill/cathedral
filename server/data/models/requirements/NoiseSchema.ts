import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Noise, Requirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<Noise, Requirement>({
    class: Noise,
    extends: RequirementSchema
})