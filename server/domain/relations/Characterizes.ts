import { Entity, OneToOne } from "@mikro-orm/core";
import { RequirementRelation } from "./RequirementRelation.js";
import { MetaRequirement } from "../MetaRequirement.js";

/**
 * X → Y
 * X is a meta-requirement involving Y
 * Meta-requirement X applies to requirement Y
 */
@Entity()
export class Characterizes extends RequirementRelation {
    constructor(props: Omit<Characterizes, 'id'>) {
        super(props);
        this.left = props.left;
    }

    @OneToOne({ entity: () => MetaRequirement })
    override left: MetaRequirement
}