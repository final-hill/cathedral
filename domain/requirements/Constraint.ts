import { Requirement } from './Requirement.js';
import { ConstraintCategory } from './ConstraintCategory.js';

/**
 * A Constraint is a property imposed by the environment
 */
export class Constraint extends Requirement {
    static override readonly reqIdPrefix = 'E.3.' as const;

    constructor({ category, ...rest }: ConstructorParameters<typeof Requirement>[0] & Pick<Constraint, 'category'>) {
        super(rest);
        this.category = category;
    }

    override get reqId() { return super.reqId as `${typeof Constraint.reqIdPrefix}${number}` | undefined }

    /**
     * Category of the constraint
     */
    readonly category: ConstraintCategory;

    override toJSON() {
        return {
            ...super.toJSON(),
            category: this.category
        }
    }
}