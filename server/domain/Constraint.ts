import { Entity, Enum, ManyToOne } from '@mikro-orm/core';
import { Requirement, ConstraintCategory, ParsedRequirement } from './index.js';

/**
 * A Constraint is a property imposed by the environment
 */
@Entity()
class Constraint extends Requirement {
    constructor({ category, follows, ...rest }: Omit<Constraint, 'id'>) {
        super(rest);
        this.category = category;
        this.follows = follows;
    }

    /**
     * Category of the constraint
     */
    @Enum({ items: () => ConstraintCategory, nullable: true })
    category?: ConstraintCategory;

    /**
     * Requirement that this constraint follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}

export { Constraint };