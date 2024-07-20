import { Entity } from "@mikro-orm/core";
import Functionality from "./Functionality.js";

/**
 * FunctionalBehavior specifies **what** behavior the system should exhibit, i.e.,
 * the results or effects of the system's operation.
 * Generally expressed in the form "system must do <requirement>"
 */
@Entity()
export default class FunctionalBehavior extends Functionality { }
