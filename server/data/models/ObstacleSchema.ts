import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Obstacle from "../../domain/requirements/Obstacle.js";
import Goal from "../../domain/requirements/Goal.js";

export default new EntitySchema<Obstacle, Goal>({
    class: Obstacle,
    extends: RequirementSchema
})