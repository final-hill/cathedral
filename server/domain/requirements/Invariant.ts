import { Requirement } from "./index.js";

/**
 * Environment property that must be maintained.
 * It exists as both an assumption and an effect.
 * (precondition and postcondition)
 */
export class Invariant extends Requirement { }