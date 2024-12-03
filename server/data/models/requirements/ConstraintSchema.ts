import { EntitySchema } from '@mikro-orm/core';
import { Constraint, Requirement, ReqType, ConstraintCategory } from '../../../../domain/requirements/index.js';

export const ConstraintSchema = new EntitySchema<Constraint, Requirement>({
    class: Constraint,
    discriminatorValue: ReqType.CONSTRAINT,
    properties: {
        category: { enum: true, items: () => ConstraintCategory }
    }
})