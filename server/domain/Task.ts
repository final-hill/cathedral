import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";

/**
 * Activity included in the project
 */
@Entity()
export class Task extends Requirement { }
