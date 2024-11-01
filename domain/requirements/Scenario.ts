import { Entity, ManyToOne } from "@mikro-orm/core";
import { Example } from "./Example.js";
import { Stakeholder } from "./Stakeholder.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";
import { Outcome } from "./Outcome.js";

/**
 * A Scenario specifies system behavior by describing paths
 * of interaction between actors and the system.
 */
@Entity({ abstract: true, discriminatorValue: ReqType.SCENARIO })
export abstract class Scenario extends Example {
    constructor({ primaryActor, outcome, ...rest }: Properties<Omit<Scenario, 'id' | 'req_type'>>) {
        super(rest);
        this.primaryActor = primaryActor;
        this.outcome = outcome;
        this.req_type = ReqType.SCENARIO;
    }

    /**
     * Primary actor involved in the scenario
     */
    @ManyToOne({ entity: () => Stakeholder })
    primaryActor?: Stakeholder;

    /**
     * The outcome (goal) that the scenario is aiming to achieve.
     */
    @ManyToOne({ entity: () => Outcome })
    outcome?: Outcome;
}