import { Entity } from "@mikro-orm/core";
import { Assumption } from "./index.js";

/**
 * The history of an Assumption
 */
@Entity()
class AssumptionHistory extends Assumption { }

export { AssumptionHistory };