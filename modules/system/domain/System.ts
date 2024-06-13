import type { Uuid } from "~/domain/Uuid";
import PEGS from "~/domain/PEGS";

/**
 * A set of related artifacts
 */
export default class System extends PEGS {
    componentIds: Uuid[] = [];
}