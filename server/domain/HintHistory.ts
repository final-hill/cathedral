import { Entity } from "@mikro-orm/core";
import { Hint } from "./index.js";

/**
 * The history of a Hint
 */
@Entity()
class HintHistory extends Hint { }

export { HintHistory };