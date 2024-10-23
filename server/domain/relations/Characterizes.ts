import { Entity } from "@mikro-orm/core";
import { RequirementRelation } from "./RequirementRelation.js";
import { MetaRequirement } from "../requirements/MetaRequirement.js";
import { type Properties } from "../types/index.js";

/**
 * X → Y
 *
 * Meta-requirement X applies to requirement Y
 */
@Entity()
export class Characterizes extends RequirementRelation {
    constructor(props: Properties<Omit<Characterizes, 'id' | 'left'> & { left: MetaRequirement }>) {
        super(props);
        this.left = props.left;
    }
}