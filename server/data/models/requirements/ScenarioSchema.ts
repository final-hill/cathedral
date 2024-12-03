import { EntitySchema } from "@mikro-orm/core";
import { Scenario, ReqType, Example } from '../../../../domain/requirements/index.js';

export const ScenarioSchema = new EntitySchema<Scenario, Example>({
    class: Scenario,
    discriminatorValue: ReqType.SCENARIO,
    abstract: true,
    properties: {
        primaryActor: { kind: 'm:1', entity: 'Stakeholder' },
        outcome: { kind: 'm:1', entity: 'Outcome' }
    }
})