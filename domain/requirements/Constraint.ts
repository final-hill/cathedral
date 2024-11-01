import { Entity, Enum } from '@mikro-orm/core';
import { Requirement } from './Requirement.js';
import { ConstraintCategory } from './ConstraintCategory.js';
import { type Properties } from '../types/index.js';
import { ReqType } from './ReqType.js';

export const constraintReqIdPrefix = 'E.3.' as const;
export type ConstraintReqId = `${typeof constraintReqIdPrefix}${number}`;

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

    override get reqId(): ConstraintReqId | undefined { return super.reqId as ConstraintReqId | undefined }
    override set reqId(value: ConstraintReqId | undefined) { super.reqId = value }

    /**
     * Category of the constraint
     */
    @Enum({ items: () => ConstraintCategory })
    category?: ConstraintCategory;
}