import { Entity, ManyToOne } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * Represents a component that is part of an environment.
 */
@Entity({ discriminatorValue: ReqType.ENVIRONMENT_COMPONENT })
export class EnvironmentComponent extends Component {
    constructor({ parentComponent, ...rest }: Properties<Omit<EnvironmentComponent, 'id' | 'req_type'>>) {
        super(rest);
        this.parentComponent = parentComponent;
        this.req_type = ReqType.ENVIRONMENT_COMPONENT;
    }

    /**
     * The parent component of the current environment component if any
     */
    @ManyToOne({ entity: () => EnvironmentComponent })
    parentComponent?: EnvironmentComponent;
}