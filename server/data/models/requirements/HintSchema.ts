import { EntitySchema } from "@mikro-orm/core";
import NoiseSchema from "./NoiseSchema.js"
import { Hint, Noise } from "../../../domain/requirements/index.js";

export default new EntitySchema<Hint, Noise>({
    class: Hint,
    extends: NoiseSchema
})