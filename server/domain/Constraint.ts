import { Entity, Enum } from '@mikro-orm/core';
import Requirement from './Requirement.js';
import { type Properties } from './Properties.js';

export enum ConstraintCategory {
    BUSINESS = 'Business Rule',
    PHYSICS = 'Physical Law',
    ENGINEERING = 'Engineering Decision'
}

/**
 * A Constraint is a property imposed by the environment
 */
@Entity()
export default class Constraint extends Requirement {
    constructor({ category, ...rest }: Omit<Properties<Constraint>, 'id'>) {
        super(rest);

        this.category = category;
    }

    @Enum(() => ConstraintCategory)
    category: ConstraintCategory;
}