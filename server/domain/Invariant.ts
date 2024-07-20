import { Entity } from "@mikro-orm/core";
import Requirement from "./Requirement.js";

/**
 * Environment property that must be maintained.
 * It exists as both an assumption and an effect.
 * (precondition and postcondition)
 */
@Entity()
export default class Invariant extends Requirement { }
