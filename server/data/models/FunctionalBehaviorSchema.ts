import { EntitySchema } from "@mikro-orm/core";
import FunctionalBehavior from "../../domain/requirements/FunctionalBehavior.js";
import Functionality from "../../domain/requirements/Functionality.js";
import BehaviorSchema from "./BehaviorSchema.js";

export default new EntitySchema<FunctionalBehavior, Functionality>({
    class: FunctionalBehavior,
    extends: BehaviorSchema,
    properties: {}
})