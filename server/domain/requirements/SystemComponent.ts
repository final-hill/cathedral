import { Component, ParsedRequirement } from "./index.js"

/**
 * A component of a system
 */
export class SystemComponent extends Component {
    constructor({ parentComponent, follows, ...rest }: Omit<SystemComponent, 'id'>) {
        super(rest);
        this.parentComponent = parentComponent;
        this.follows = follows;
    }

    /**
     * Requirement that this system component follows from
     */
    follows?: ParsedRequirement;

    /**
     * Parent component of the current system component
     */
    parentComponent?: SystemComponent;
}
