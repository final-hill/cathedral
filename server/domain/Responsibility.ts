import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";

/**
 * Assignment of behavior or task to a component
 */
@Entity()
export class Responsibility extends Requirement { }
