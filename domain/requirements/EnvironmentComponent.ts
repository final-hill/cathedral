import { Entity } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * Represents a component that is part of an environment.
 */
@Entity({ discriminatorValue: ReqType.ENVIRONMENT_COMPONENT })
export class EnvironmentComponent extends Component {
    static override reqIdPrefix = 'E.2.' as const;

    constructor(props: Properties<Omit<EnvironmentComponent, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.ENVIRONMENT_COMPONENT;
    }

    override get reqId() { return super.reqId as `${typeof EnvironmentComponent.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}