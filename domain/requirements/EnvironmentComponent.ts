import { Component } from "./Component.js";
import { ReqType } from "./ReqType.js";

/**
 * Represents a component that is part of an environment.
 */
export class EnvironmentComponent extends Component {
    static override reqIdPrefix = 'E.2.' as const;
    static override req_type = ReqType.ENVIRONMENT_COMPONENT;

    override get reqId() { return super.reqId as `${typeof EnvironmentComponent.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}