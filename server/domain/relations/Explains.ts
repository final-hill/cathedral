import { Entity } from "@mikro-orm/core";
import { Repeats } from "./Repeats.js";

/**
 * X ≅ Y
 *
 * X ⇔ Y, and X has a different type from Y.
 * In other words, Y introduces no new property but helps understand X better.
 * Same properties, different type (notation-wise)
 */
@Entity()
export class Explains extends Repeats { }