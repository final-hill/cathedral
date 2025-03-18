import { RequirementRelation } from "./RequirementRelation.js";

export const Excepts = RequirementRelation.extend({})
    .describe('left \\\\ right: left specifies an exception to the property specified by right');