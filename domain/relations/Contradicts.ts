import { Entity } from "@mikro-orm/core";
import { RequirementRelation } from "./RequirementRelation.js";

/**
 * X ⊕ Y
 *
 * Properties specified by X and Y cannot both hold
 */
@Entity()
export class Contradicts extends RequirementRelation { }