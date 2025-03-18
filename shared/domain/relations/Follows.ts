import { RequirementRelation } from "./RequirementRelation.js";

export const Follows = RequirementRelation.extend({})
    .describe('left ⊣ right: left is a consequence of the property specified by right');