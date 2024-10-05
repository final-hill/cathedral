import { Entity } from "@mikro-orm/core";
import { Effect } from "./index.js";

/**
 * The history of an Effect
 */
@Entity()
class EffectHistory extends Effect { }

export { EffectHistory };