import { Entity } from "@mikro-orm/core";
import { Behavior } from "./Behavior.js";

/**
 * Illustration of behavior through a usage scenario
 */
@Entity({ abstract: true })
export abstract class Example extends Behavior { }
