import { Entity } from "@mikro-orm/core";
import { RequirementRelation } from "./RequirementRelation.js";

/**
 * X ⇔ Y
 * X specifies the same property as Y
 */
@Entity()
export class Repeats extends RequirementRelation { }