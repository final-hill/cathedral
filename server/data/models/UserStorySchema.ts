import { EntitySchema } from "@mikro-orm/core";
import Scenario from "../../domain/requirements/Scenario.js";
import UserStory from "../../domain/requirements/UserStory.js";
import ScenarioSchema from "./ScenarioSchema.js";

export default new EntitySchema<UserStory, Scenario>({
    class: UserStory,
    extends: ScenarioSchema,
    properties: {
        functionalBehavior: { kind: 'm:1', entity: 'FunctionalBehavior', nullable: false },
        outcome: { kind: 'm:1', entity: 'Outcome', nullable: false }
    }
})