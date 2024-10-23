import { Entity, ManyToOne } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * Represents a component that is part of an environment.
 */
@Entity({ discriminatorValue: ReqType.ENVIRONMENT_COMPONENT })
export class EnvironmentComponent extends Component {
    constructor(props: Properties<Omit<EnvironmentComponent, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.ENVIRONMENT_COMPONENT;
    }
}