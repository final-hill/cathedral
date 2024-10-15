import { Entity } from "@mikro-orm/core";
import { RequirementRelation } from "./RequirementRelation.js";

/**
 * X ⊆ Y
 * X is a sub-requirement of Y
 * X is textually included in Y
 */
@Entity()
export class Belongs extends RequirementRelation { }