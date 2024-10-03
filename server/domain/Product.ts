import { Entity } from "@mikro-orm/core";
import { Requirement } from "./index.js";

/**
 * Artifact needed or produced by a task
 */
@Entity()
class Product extends Requirement { }

export { Product };