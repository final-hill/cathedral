import { Component } from "./Component.js";

/**
 * A component of a system
 */
export class SystemComponent extends Component {
    static override readonly reqIdPrefix = 'S.1.' as const;

    override get reqId() { return super.reqId as `${typeof SystemComponent.reqIdPrefix}${number}` | undefined }
}