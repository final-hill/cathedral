import { type Properties } from '../Properties.js';
import { Requirement, ConstraintCategory } from './index.js';

/**
 * A Constraint is a property imposed by the environment
 */
export class Constraint extends Requirement {
    constructor({ category, ...rest }: Omit<Properties<Constraint>, 'id'>) {
        super(rest);
        this.category = category;
    }

    /**
     * Category of the constraint
     */
    category?: ConstraintCategory;
}
