import { Entity } from "@mikro-orm/core";
import { Behavior } from "./Behavior.js";

/**
 * Functionality describes what system will do and how it will do it.
 */
@Entity({ abstract: true })
export abstract class Functionality extends Behavior { }