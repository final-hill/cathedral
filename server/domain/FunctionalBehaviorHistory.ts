import { Entity } from "@mikro-orm/core";
import { FunctionalBehavior } from "./index.js";

/**
 * The history of a FunctionalBehavior
 */
@Entity()
class FunctionalBehaviorHistory extends FunctionalBehavior { }

export { FunctionalBehaviorHistory };