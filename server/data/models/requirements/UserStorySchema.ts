import { EntitySchema } from "@mikro-orm/core";
import ScenarioSchema from "./ScenarioSchema.js";
import { Scenario, UserStory } from "../../../domain/requirements/index.js";

export default new EntitySchema<UserStory, Scenario>({
    class: UserStory,
    extends: ScenarioSchema,
    properties: {
        functionalBehavior: { kind: 'm:1', entity: 'FunctionalBehavior', nullable: true },
        outcome: { kind: 'm:1', entity: 'Outcome', nullable: true }
    }
})