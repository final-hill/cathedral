import { Entity } from "@mikro-orm/core";
import { Requirement } from "./index.js";

/**
 * Property that is in requirements but should not be
 */
@Entity()
class Noise extends Requirement { }

export { Noise };