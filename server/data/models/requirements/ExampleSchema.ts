import { EntitySchema } from "@mikro-orm/core";
import { Behavior, Example, ReqType } from '../../../../domain/requirements/index.js';

export const ExampleSchema = new EntitySchema<Example, Behavior>({
    class: Example,
    discriminatorValue: ReqType.EXAMPLE
})