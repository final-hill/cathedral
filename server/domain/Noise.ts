import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";

/**
 * Property that is in requirements but should not be
 */
@Entity()
export class Noise extends Requirement { }