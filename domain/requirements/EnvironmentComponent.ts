import { Component } from "./Component.js";

/**
 * Represents a component that is part of an environment.
 */
export class EnvironmentComponent extends Component {
    static override readonly reqIdPrefix = 'E.2.' as const;

    override get reqId() { return super.reqId as `${typeof EnvironmentComponent.reqIdPrefix}${number}` | undefined }
}