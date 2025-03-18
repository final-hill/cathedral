import { RequirementRelation } from "./RequirementRelation.js";

export const Repeats = RequirementRelation.extend({})
    .describe('left ⇔ right: left specifies the same property as right');