import { RequirementRelation } from "./RequirementRelation.js";

/**
 * X ⊕ Y
 *
 * Properties specified by X and Y cannot both hold
 */
export class Contradicts extends RequirementRelation { }