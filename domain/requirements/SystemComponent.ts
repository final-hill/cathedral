import { Entity } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

export const systemComponentReqIdPrefix = 'S.1.' as const;
export type SystemComponentReqId = `${typeof systemComponentReqIdPrefix}${number}`;

/**
 * A component of a system
 */
@Entity({ discriminatorValue: ReqType.SYSTEM_COMPONENT })
export class SystemComponent extends Component {
    constructor(props: Properties<Omit<SystemComponent, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.SYSTEM_COMPONENT;
    }

    override get reqId(): SystemComponentReqId | undefined { return super.reqId as SystemComponentReqId | undefined }
    override set reqId(value: SystemComponentReqId | undefined) { super.reqId = value }
}