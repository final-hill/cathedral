import { Entity } from "@mikro-orm/core";
import { Extends } from "./Extends.js";

/**
 * X » Y
 *
 * X adds detail to properties of Y
 */
@Entity()
export class Details extends Extends { }