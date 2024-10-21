import { Entity } from "@mikro-orm/core";
import { RequirementRelation } from "./RequirementRelation.js";

/**
 * X > Y
 *
 * aka "refines".
 * X assumes Y and specifies a property that Y does not.
 * X adds to properties of Y
 */
@Entity()
export class Extends extends RequirementRelation { }