import { Entity } from "@mikro-orm/core";
import Goal from "./Goal.js";

/**
 * A result desired by an organization
 */
@Entity()
export default class Outcome extends Goal { }