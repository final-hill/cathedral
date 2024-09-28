import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Hint, Noise } from "../../../domain/requirements/index.js";

export default new EntitySchema<Hint, Noise>({
    class: Hint,
    extends: RequirementSchema
})