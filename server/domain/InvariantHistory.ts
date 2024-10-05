import { Entity } from "@mikro-orm/core";
import { Invariant } from "./index.js";

/**
 * The history of an Invariant
 */
@Entity()
class InvariantHistory extends Invariant { }

export { InvariantHistory };