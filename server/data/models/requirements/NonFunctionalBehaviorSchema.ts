import { EntitySchema } from "@mikro-orm/core";
import { Functionality, NonFunctionalBehavior, ReqType } from '../../../../domain/requirements/index.js';

export const NonFunctionalBehaviorSchema = new EntitySchema<NonFunctionalBehavior, Functionality>({
    class: NonFunctionalBehavior,
    discriminatorValue: ReqType.NON_FUNCTIONAL_BEHAVIOR
})