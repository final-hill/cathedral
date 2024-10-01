import { EntitySchema } from "@mikro-orm/core";
import BehaviorSchema from "./BehaviorSchema.js";
import { FunctionalBehavior, Functionality, ParsedRequirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<FunctionalBehavior, Functionality>({
    class: FunctionalBehavior,
    extends: BehaviorSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true }
    }
})