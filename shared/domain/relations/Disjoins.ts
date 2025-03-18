import { RequirementRelation } from "./RequirementRelation.js";

export const Disjoins = RequirementRelation.extend({})
    .describe('left || right: left and right are unrelated');