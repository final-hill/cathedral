import Requirement from './Requirement.mjs';

/**
 * An assumption is a property of the environment that is assumed to be true.
 * Assumptions are used to simplify the problem and to make it more tractable.
 * An example of an assumption would be: "Screen resolutions will not change during the execution of the program."
 */
export default class Assumption extends Requirement { }