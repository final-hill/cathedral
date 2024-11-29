import { BaseEntity, Entity, ManyToOne } from "@mikro-orm/core";
import { Requirement } from '../requirements/Requirement.js'

/**
 * Relations between requirements
 */
@Entity({ abstract: true, discriminatorColumn: 'rel_type' })
export abstract class RequirementRelation extends BaseEntity {
    constructor({ left, right }: { left: Requirement, right: Requirement }) {
        super()
        this.left = left;
        this.right = right;
    }

    /**
     * The left-hand side of the relation
     */
    @ManyToOne({ primary: true, entity: () => Requirement })
    left: Requirement

    /**
     * The right-hand side of the relation
     */
    @ManyToOne({ primary: true, entity: () => Requirement })
    right: Requirement
}