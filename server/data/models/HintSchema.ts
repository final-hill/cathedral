import { EntitySchema } from "@mikro-orm/core";
import Hint from "../../domain/Hint.js";
import Noise from "../../domain/Noise.js";
import RequirementSchema from "./RequirementSchema.js";

export default new EntitySchema<Hint, Noise>({
    class: Hint,
    extends: RequirementSchema
})