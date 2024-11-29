import { Entity, Enum } from '@mikro-orm/core';
import { Requirement } from './Requirement.js';
import { ConstraintCategory } from './ConstraintCategory.js';
import { ReqType } from './ReqType.js';

/**
 * A Constraint is a property imposed by the environment
 */
@Entity({ discriminatorValue: ReqType.CONSTRAINT })
export class Constraint extends Requirement {
    static override reqIdPrefix = 'E.3.' as const;
    static override req_type = ReqType.CONSTRAINT;

    constructor({ category, ...rest }: ConstructorParameters<typeof Requirement>[0] & Pick<Constraint, 'category'>) {
        super(rest);
        this.category = category;
    }

    override get reqId() { return super.reqId as `${typeof Constraint.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }

    /**
     * Category of the constraint
     */
    @Enum({ items: () => ConstraintCategory })
    category?: ConstraintCategory;
}