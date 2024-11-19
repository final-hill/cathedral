import { Entity } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { ReqType } from "./ReqType.js";

/**
 * A component of a system
 */
@Entity({ discriminatorValue: ReqType.SYSTEM_COMPONENT })
export class SystemComponent extends Component {
    static override reqIdPrefix = 'S.1.' as const;
    static override req_type = ReqType.SYSTEM_COMPONENT;

    override get reqId() { return super.reqId as `${typeof SystemComponent.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}