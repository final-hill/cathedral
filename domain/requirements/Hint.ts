import { Noise } from "./Noise.js";
import { ReqType } from "./ReqType.js";

/**
 * Design or implementation suggestion
 */
export class Hint extends Noise {
    static override req_type: ReqType = ReqType.HINT;
}