import { type Properties } from "../Properties.js";
import { Component } from "./index.js"

export class SystemComponent extends Component {
    constructor({ parentComponent, ...rest }: Omit<Properties<SystemComponent>, 'id'>) {
        super(rest);
        this.parentComponent = parentComponent;
    }

    /**
     * Parent component of the current system component
     */
    parentComponent?: SystemComponent;
}
