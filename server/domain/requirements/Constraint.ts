import Requirement from './Requirement.js';
import { type Properties } from '../Properties.js';
import ConstraintCategory from './ConstraintCategory.js';

/**
 * A Constraint is a property imposed by the environment
 */
export default class Constraint extends Requirement {
    constructor({ category, ...rest }: Omit<Properties<Constraint>, 'id'>) {
        super(rest);

        this.category = category;
    }

    category: ConstraintCategory;

    override toJSON() {
        return {
            ...super.toJSON(),
            category: this.category
        };
    }
}