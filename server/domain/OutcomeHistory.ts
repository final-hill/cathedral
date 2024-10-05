import { Entity } from "@mikro-orm/core";
import { Outcome } from "./index.js";

/**
 * The history of an Outcome
 */
@Entity()
class OutcomeHistory extends Outcome { }

export { OutcomeHistory };