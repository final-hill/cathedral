import { Entity } from "@mikro-orm/core";
import Requirement from "./Requirement.js";

/**
 * Exclusion from the scope of requirements
 */
@Entity()
export default class Limit extends Requirement { }