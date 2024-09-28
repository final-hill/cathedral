import { type Properties } from "../Properties.js";
import { Component } from "./index.js";

export class EnvironmentComponent extends Component {
    constructor({ parentComponent, ...rest }: Omit<Properties<EnvironmentComponent>, 'id'>) {
        super(rest);
        this.parentComponent = parentComponent;
    }

    /**
     * The parent component of the current environment component if any
     */
    parentComponent?: EnvironmentComponent;
}
