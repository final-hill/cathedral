import { RequirementRelation } from "./RequirementRelation.js";
import { MetaRequirement } from "../requirements/MetaRequirement.js";

/**
 * X → Y
 *
 * Meta-requirement X applies to requirement Y
 */
export class Characterizes extends RequirementRelation {
    constructor(props: Omit<Pick<Characterizes, keyof Characterizes>, 'id' | 'left'> & { left: MetaRequirement }) {
        super(props);
    }
}