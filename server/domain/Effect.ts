import { Entity } from "@mikro-orm/core";
import Requirement from "./Requirement.js";

/**
 * Environment property affected by the system
 */
@Entity()
export default class Effect extends Requirement { }
