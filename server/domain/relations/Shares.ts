import { Entity } from "@mikro-orm/core";
import { Repeats } from "./Repeats.js";

/**
 * X ∩ Y
 *
 * X' ⇔ Y' for some sub-requirements X' and Y' of X and Y.
 * (Involve Repeats)
 * Some subrequirement is in common between X and Y.
 */
@Entity()
export class Shares extends Repeats { }