import { EntitySchema } from "@mikro-orm/core";
import Functionality from "../../domain/requirements/Functionality.js";
import BehaviorSchema from "./BehaviorSchema.js";
import NonFunctionalBehavior from "../../domain/requirements/NonFunctionalBehavior.js";

export default new EntitySchema<NonFunctionalBehavior, Functionality>({
    class: NonFunctionalBehavior,
    extends: BehaviorSchema,
    properties: {}
})