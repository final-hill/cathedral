import { Entity } from "@mikro-orm/core";
import { Responsibility } from "./Responsibility.js";

/**
 * Human responsibility
 */
@Entity()
export class Role extends Responsibility { }
