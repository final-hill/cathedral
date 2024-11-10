import { Entity } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * A component of a system
 */
@Entity({ discriminatorValue: ReqType.SYSTEM_COMPONENT })
export class SystemComponent extends Component {
    static override reqIdPrefix = 'S.1.' as const;

    constructor(props: Properties<Omit<SystemComponent, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.SYSTEM_COMPONENT;
    }

    override get reqId() { return super.reqId as `${typeof SystemComponent.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}