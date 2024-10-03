import { Entity } from "@mikro-orm/core";
import { Noise } from "./index.js";

/**
 * Design or implementation suggestion
 */
@Entity()
class Hint extends Noise { }

export { Hint };