import { RequirementRelation } from "./RequirementRelation.js";

export const Contradicts = RequirementRelation.extend({})
    .describe('left ⊕ right: Properties specified by left and right cannot both hold');