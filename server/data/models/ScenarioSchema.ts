import { EntitySchema } from "@mikro-orm/core";
import BehaviorSchema from "./BehaviorSchema.js";
import { Example, Scenario } from "../../domain/requirements/index.js";

export default new EntitySchema<Scenario, Example>({
    abstract: true,
    class: Scenario,
    extends: BehaviorSchema,
    properties: {
        primaryActor: { kind: 'm:1', entity: 'Stakeholder', ref: true, nullable: false }
    }
})