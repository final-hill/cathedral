import type Behavior from "./Behavior";
import PEGS from "./PEGS";

/**
 * A set of related artifacts
 */
export default class System extends PEGS {
    behaviors: Behavior[] = [];
}
