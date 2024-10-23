import { Entity } from "@mikro-orm/core";
import { Responsibility } from "./Responsibility.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * Human responsibility
 */
@Entity({ discriminatorValue: ReqType.ROLE })
export class Role extends Responsibility {
    constructor(props: Properties<Omit<Role, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.ROLE
    }
}
