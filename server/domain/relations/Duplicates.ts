import { Entity } from "@mikro-orm/core";
import { Repeats } from "./Repeats.js";

/**
 * X ≡ Y
 *
 * X ⇔ Y, and X has the same type as Y
 * In other words, X and Y are redundant
 * Same properties, same type (notation-wise, X ≡ Y)
 */
@Entity()
export class Duplicates extends Repeats { }