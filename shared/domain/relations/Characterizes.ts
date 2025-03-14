import { RequirementRelation } from "./RequirementRelation.js";

export const Characterizes = RequirementRelation.extend({})
    .describe('left → right: Meta-requirement left applies to requirement right');