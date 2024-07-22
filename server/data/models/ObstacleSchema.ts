import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Obstacle from "../../domain/Obstacle.js";
import Goal from "../../domain/Goal.js";

export default new EntitySchema<Obstacle, Goal>({
    class: Obstacle,
    extends: RequirementSchema
})