import { Entity } from "@mikro-orm/core";
import { Stakeholder } from "./index.js";

/**
 * The history of a Stakeholder
 */
@Entity()
class StakeholderHistory extends Stakeholder { }

export { StakeholderHistory };