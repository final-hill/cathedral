import { Entity } from "@mikro-orm/core";
import { RequirementRelation } from "./RequirementRelation.js";

/**
 * X ⊣ Y
 *
 * X is a consequence of the property specified by Y
 */
@Entity()
export class Follows extends RequirementRelation { }