import { AuditMetadata } from "../AuditMetadata";

/**
 * Relations between requirements
 */
export abstract class RequirementRelation extends AuditMetadata {
    constructor(props: Pick<RequirementRelation, keyof RequirementRelation>) {
        super(props)
        this.leftId = props.leftId
        this.rightId = props.rightId
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