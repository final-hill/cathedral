import { EntitySchema } from "@mikro-orm/core";
import BehaviorSchema from "./BehaviorSchema.js";
import { Functionality, NonFunctionalBehavior } from "../../../domain/requirements/index.js";

export default new EntitySchema<NonFunctionalBehavior, Functionality>({
    class: NonFunctionalBehavior,
    extends: BehaviorSchema,
    properties: {}
})