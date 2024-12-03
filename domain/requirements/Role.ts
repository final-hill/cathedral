import { Responsibility } from "./Responsibility.js";
import { ReqType } from "./ReqType.js";

/**
 * Human responsibility
 */
export class Role extends Responsibility {
    static override req_type: ReqType = ReqType.ROLE;
}
