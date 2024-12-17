/**
 * Relations between requirements
 */
export abstract class RequirementRelation {
    constructor({ leftId, rightId }: Pick<RequirementRelation, keyof RequirementRelation>) {
        this.leftId = leftId;
        this.rightId = rightId;
    }

    /**
     * The left-hand side of the relation
     */
    readonly leftId: string

    /**
     * The right-hand side of the relation
     */
    readonly rightId: string
}