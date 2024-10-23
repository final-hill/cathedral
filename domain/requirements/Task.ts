import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * Activity included in the project
 */
@Entity({ discriminatorValue: ReqType.TASK })
export class Task extends Requirement {
    constructor(props: Properties<Omit<Task, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.TASK
    }
}
