import { EntitySchema } from "@mikro-orm/core";
import { Behavior, Requirement, ReqType, MoscowPriority } from '../../../../domain/requirements/index.js';

export const BehaviorSchema = new EntitySchema<Behavior, Requirement>({
    class: Behavior,
    discriminatorValue: ReqType.BEHAVIOR,
    properties: {
        priority: { enum: true, items: () => MoscowPriority }
    }
})