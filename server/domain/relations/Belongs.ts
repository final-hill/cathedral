import { Entity } from "@mikro-orm/core";
import { RequirementRelation } from "./RequirementRelation.js";

/**
 * X ⊆ Y
 *
 * X is a sub-requirement of Y; textually included
 */
@Entity()
export class Belongs extends RequirementRelation { }