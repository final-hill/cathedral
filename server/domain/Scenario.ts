import { Entity, ManyToOne } from "@mikro-orm/core";
import { Example } from "./Example.js";
import { Stakeholder } from "./Stakeholder.js";

/**
 * A Scenario specifies system behavior by describing paths
 * of interaction between actors and the system.
 */
@Entity({ abstract: true })
export abstract class Scenario extends Example {
    constructor({ primaryActor, ...rest }: Omit<Scenario, 'id'>) {
        super(rest);
        this.primaryActor = primaryActor;
    }

    /**
     * Primary actor involved in the scenario
     */
    @ManyToOne({ entity: () => Stakeholder, nullable: true })
    primaryActor?: Stakeholder;
}