import { EntitySchema } from "@mikro-orm/core";
import BehaviorSchema from "./BehaviorSchema.js";
import { FunctionalBehavior, Functionality } from "../../domain/requirements/index.js";

export default new EntitySchema<FunctionalBehavior, Functionality>({
    class: FunctionalBehavior,
    extends: BehaviorSchema,
    properties: {}
})