import { Entity, Enum } from '@mikro-orm/core';
import { Requirement } from './Requirement.js';
import { ConstraintCategory } from './ConstraintCategory.js';
import { type Properties } from '../types/index.js';
import { ReqType } from './ReqType.js';

/**
 * A Constraint is a property imposed by the environment
 */
@Entity({ discriminatorValue: ReqType.CONSTRAINT })
export class Constraint extends Requirement {
    constructor({ category, ...rest }: Properties<Omit<Constraint, 'id' | 'req_type'>>) {
        super(rest);
        this.category = category;
        this.req_type = ReqType.CONSTRAINT;
    }

    /**
     * Category of the constraint
     */
    @Enum({ items: () => ConstraintCategory })
    category?: ConstraintCategory;
}