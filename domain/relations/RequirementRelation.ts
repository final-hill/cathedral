import { Requirement } from '../requirements/Requirement.js'

/**
 * Relations between requirements
 */
export abstract class RequirementRelation {
    constructor({ left, right }: { left: Requirement, right: Requirement }) {
        this.left = left;
        this.right = right;
    }

    /**
     * The left-hand side of the relation
     */
    left: Requirement

    /**
     * The right-hand side of the relation
     */
    right: Requirement
}