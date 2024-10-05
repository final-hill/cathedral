import { Entity } from "@mikro-orm/core";
import { NonFunctionalBehavior } from "./index.js";

/**
 * The history of a NonFunctionalBehavior
 */
@Entity()
class NonFunctionalBehaviorHistory extends NonFunctionalBehavior { }

export { NonFunctionalBehaviorHistory };