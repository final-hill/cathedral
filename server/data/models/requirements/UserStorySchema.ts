import { EntitySchema } from "@mikro-orm/core";
import ScenarioSchema from "./ScenarioSchema.js";
import { FunctionalBehavior, Outcome, ParsedRequirement, Scenario, UserStory } from "../../../domain/requirements/index.js";

export default new EntitySchema<UserStory, Scenario>({
    class: UserStory,
    extends: ScenarioSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true },
        functionalBehavior: { kind: 'm:1', entity: () => FunctionalBehavior, nullable: true },
        outcome: { kind: 'm:1', entity: () => Outcome, nullable: true }
    }
})