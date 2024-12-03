import { EntitySchema } from '@mikro-orm/core';
import { Solution, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const SolutionSchema = new EntitySchema<Solution, Requirement>({
    class: Solution,
    discriminatorValue: ReqType.SOLUTION,
    properties: {
        slug: { type: 'string', unique: true }
    }
})