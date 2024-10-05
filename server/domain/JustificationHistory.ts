import { Entity } from "@mikro-orm/core";
import { Justification } from "./index.js";

/**
 * The history of a Justification
 */
@Entity()
class JustificationHistory extends Justification { }

export { JustificationHistory };