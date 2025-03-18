import { RequirementRelation } from "./RequirementRelation.js";

export const Extends = RequirementRelation.extend({})
    .describe('left > right: left adds detail to properties of right. aka "refines"');