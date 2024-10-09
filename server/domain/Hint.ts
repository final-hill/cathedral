import { Entity } from "@mikro-orm/core";
import { Noise } from "./Noise.js";

/**
 * Design or implementation suggestion
 */
@Entity()
export class Hint extends Noise { }