import { EntitySchema } from "@mikro-orm/core";
import BehaviorSchema from "./BehaviorSchema.js";
import { Functionality, NonFunctionalBehavior, ParsedRequirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<NonFunctionalBehavior, Functionality>({
    class: NonFunctionalBehavior,
    extends: BehaviorSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true }
    }
})