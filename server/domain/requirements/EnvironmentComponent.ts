import { Component, ParsedRequirement } from "./index.js";

/**
 * Represents a component that is part of an environment.
 */
export class EnvironmentComponent extends Component {
    constructor({ parentComponent, follows, ...rest }: Omit<EnvironmentComponent, 'id'>) {
        super(rest);
        this.parentComponent = parentComponent;
        this.follows = follows;
    }

    /**
     * The parent component of the current environment component if any
     */
    parentComponent?: EnvironmentComponent;

    /**
     * Requirement that this environment component follows from
     */
    follows?: ParsedRequirement;
}
