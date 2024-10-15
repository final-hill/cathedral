import { Entity } from "@mikro-orm/core";
import { RequirementRelation } from "./RequirementRelation.js";

/**
 * X \\ Y
 * X specifies an exception to the property specified by Y.
 */
@Entity()
export class Excepts extends RequirementRelation { }