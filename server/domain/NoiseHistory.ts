import { Entity } from "@mikro-orm/core";
import { Noise } from "./index.js";

/**
 * The history of a Noise
 */
@Entity()
class NoiseHistory extends Noise { }

export { NoiseHistory };