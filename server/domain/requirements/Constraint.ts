import { Requirement, ConstraintCategory, ParsedRequirement } from './index.js';

/**
 * A Constraint is a property imposed by the environment
 */
export class Constraint extends Requirement {
    constructor({ category, follows, ...rest }: Omit<Constraint, 'id'>) {
        super(rest);
        this.category = category;
        this.follows = follows;
    }

    /**
     * Category of the constraint
     */
    category?: ConstraintCategory;

    /**
     * Requirement that this constraint follows from
     */
    follows?: ParsedRequirement;
}
