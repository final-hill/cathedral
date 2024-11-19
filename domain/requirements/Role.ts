import { Entity } from "@mikro-orm/core";
import { Responsibility } from "./Responsibility.js";
import { ReqType } from "./ReqType.js";

/**
 * Human responsibility
 */
@Entity({ discriminatorValue: ReqType.ROLE })
export class Role extends Responsibility {
    static override req_type: ReqType = ReqType.ROLE;
}
