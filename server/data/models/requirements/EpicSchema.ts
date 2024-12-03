import { EntitySchema } from "@mikro-orm/core";
import { Epic, ReqType, Scenario } from '../../../../domain/requirements/index.js';

export const EpicSchema = new EntitySchema<Epic, Scenario>({
    class: Epic,
    discriminatorValue: ReqType.EPIC,
    properties: {
        functionalBehavior: { kind: 'm:1', entity: 'FunctionalBehavior' }
    }
})