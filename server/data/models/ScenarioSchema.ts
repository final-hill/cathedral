import { EntitySchema } from "@mikro-orm/core";
import Example from "../../domain/requirements/Example.js";
import Scenario from "../../domain/requirements/Scenario.js";
import BehaviorSchema from "./BehaviorSchema.js";

export default new EntitySchema<Scenario, Example>({
    abstract: true,
    class: Scenario,
    extends: BehaviorSchema,
    properties: {
        primaryActor: { kind: 'm:1', entity: 'Stakeholder', ref: true, nullable: false }
    }
})