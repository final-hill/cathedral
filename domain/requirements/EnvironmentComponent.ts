import { Entity } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

export const environmentComponentReqIdPrefix = 'E.2.' as const;
export type EnvironmentComponentReqId = `${typeof environmentComponentReqIdPrefix}${number}`;

/**
 * Represents a component that is part of an environment.
 */
@Entity({ discriminatorValue: ReqType.ENVIRONMENT_COMPONENT })
export class EnvironmentComponent extends Component {
    constructor(props: Properties<Omit<EnvironmentComponent, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.ENVIRONMENT_COMPONENT;
    }

    override get reqId(): EnvironmentComponentReqId | undefined { return super.reqId as EnvironmentComponentReqId | undefined }
    override set reqId(value: EnvironmentComponentReqId | undefined) { super.reqId = value }
}