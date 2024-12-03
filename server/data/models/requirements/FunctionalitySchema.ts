import { EntitySchema } from '@mikro-orm/core';
import { Functionality, Behavior, ReqType } from '../../../../domain/requirements/index.js';

export const FunctionalitySchema = new EntitySchema<Functionality, Behavior>({
    class: Functionality,
    discriminatorValue: ReqType.FUNCTIONALITY
})