import { EntitySchema } from "@mikro-orm/core";
import Functionality from "../../domain/Functionality.js";
import BehaviorSchema from "./BehaviorSchema.js";
import NonFunctionalBehavior from "../../domain/NonFunctionalBehavior.js";

export default new EntitySchema<NonFunctionalBehavior, Functionality>({
    class: NonFunctionalBehavior,
    extends: BehaviorSchema,
    properties: {}
})