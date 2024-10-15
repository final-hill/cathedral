import { Entity } from "@mikro-orm/core";
import { RequirementRelation } from "./RequirementRelation.js";

/**
 * X ▸ Y
 * Constraint X applies to Y
 */
@Entity()
export class Constrains extends RequirementRelation { }