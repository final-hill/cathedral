import { RequirementRelation } from "./RequirementRelation.js";

export const Belongs = RequirementRelation.extend({})
    .describe('left ⊆ right: left is a sub-requirement of right; textually included')