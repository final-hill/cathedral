import { Entity, ManyToOne } from "@mikro-orm/core";
import { Component, ParsedRequirement } from "./index.js";

/**
 * Represents a component that is part of an environment.
 */
@Entity()
class EnvironmentComponent extends Component {
    constructor({ parentComponent, follows, ...rest }: Omit<EnvironmentComponent, 'id'>) {
        super(rest);
        this.parentComponent = parentComponent;
        this.follows = follows;
    }

    /**
     * The parent component of the current environment component if any
     */
    @ManyToOne({ entity: () => EnvironmentComponent, nullable: true })
    parentComponent?: EnvironmentComponent;

    /**
     * Requirement that this environment component follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}

export { EnvironmentComponent };