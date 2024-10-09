import { Entity, ManyToOne } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { ParsedRequirement } from "./ParsedRequirement.js";

/**
 * A component of a system
 */
@Entity()
export class SystemComponent extends Component {
    constructor({ parentComponent, follows, ...rest }: Omit<SystemComponent, 'id'>) {
        super(rest);
        this.parentComponent = parentComponent;
        this.follows = follows;
    }

    /**
     * Requirement that this system component follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;

    /**
     * Parent component of the current system component
     */
    @ManyToOne({ entity: () => SystemComponent, nullable: true })
    parentComponent?: SystemComponent;
}