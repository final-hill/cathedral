import { Entity, Enum, ManyToOne } from '@mikro-orm/core';
import { Requirement } from './Requirement.js';
import { ConstraintCategory } from './ConstraintCategory.js';
import { ParsedRequirement } from './ParsedRequirement.js';

/**
 * A Constraint is a property imposed by the environment
 */
@Entity()
export class Constraint extends Requirement {
    constructor({ category, follows, ...rest }: Omit<Constraint, 'id'>) {
        super(rest);
        this.category = category;
        this.follows = follows;
    }

    /**
     * Category of the constraint
     */
    @Enum({ items: () => ConstraintCategory })
    category?: ConstraintCategory;

    /**
     * Requirement that this constraint follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement })
    follows?: ParsedRequirement;
}