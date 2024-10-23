import { Entity, ManyToOne } from "@mikro-orm/core";
import { Example } from "./Example.js";
import { Stakeholder } from "./Stakeholder.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * A Scenario specifies system behavior by describing paths
 * of interaction between actors and the system.
 */
@Entity({ abstract: true, discriminatorValue: ReqType.SCENARIO })
export abstract class Scenario extends Example {
    constructor({ primaryActor, ...rest }: Properties<Omit<Scenario, 'id' | 'req_type'>>) {
        super(rest);
        this.primaryActor = primaryActor;
        this.req_type = ReqType.SCENARIO;
    }

    /**
     * Primary actor involved in the scenario
     */
    @ManyToOne({ entity: () => Stakeholder })
    primaryActor?: Stakeholder;
}