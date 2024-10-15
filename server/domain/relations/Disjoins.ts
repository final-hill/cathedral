import { Entity } from "@mikro-orm/core";
import { RequirementRelation } from "./RequirementRelation.js";

/**
 * X || Y
 * X and Y are unrelated
 */
@Entity()
export class Disjoins extends RequirementRelation { }