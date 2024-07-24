import { EntitySchema } from "@mikro-orm/core";
import Hint from "../../domain/requirements/Hint.js";
import Noise from "../../domain/requirements/Noise.js";
import RequirementSchema from "./RequirementSchema.js";

export default new EntitySchema<Hint, Noise>({
    class: Hint,
    extends: RequirementSchema
})