import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Obstacle, Goal } from "../../../domain/requirements/index.js";

export default new EntitySchema<Obstacle, Goal>({
    class: Obstacle,
    extends: RequirementSchema
})