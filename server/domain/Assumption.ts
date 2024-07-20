import { Entity } from "@mikro-orm/core";
import Requirement from "./Requirement.js";

/**
 * Posited property of the environment
 */
@Entity()
export default class Assumption extends Requirement { }
