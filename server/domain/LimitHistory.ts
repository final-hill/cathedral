import { Entity } from "@mikro-orm/core";
import { Limit } from "./index.js";

/**
 * The history of a Limit
 */
@Entity()
class LimitHistory extends Limit { }

export { LimitHistory };