import { EntitySchema } from "@mikro-orm/core";
import { FunctionalBehavior, Functionality, ReqType } from '../../../../domain/requirements/index.js';

export const FunctionalBehaviorSchema = new EntitySchema<FunctionalBehavior, Functionality>({
    class: FunctionalBehavior,
    discriminatorValue: ReqType.FUNCTIONAL_BEHAVIOR
})