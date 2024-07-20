import { Entity } from "@mikro-orm/core";
import Requirement from "./Requirement.js";

/**
 * Artifact needed or produced by a task
 */
@Entity()
export default class Product extends Requirement { }
