import { Entity, ManyToOne } from "@mikro-orm/core";
import { Example, Stakeholder } from "./index.js";

/**
 * A Scenario specifies system behavior by describing paths
 * of interaction between actors and the system.
 */
@Entity({ abstract: true })
abstract class Scenario extends Example {
    constructor({ primaryActor, ...rest }: Omit<Scenario, 'id' | 'sysPeriod'>) {
        super(rest);
        this.primaryActor = primaryActor;
    }

    /**
     * Primary actor involved in the scenario
     */
    @ManyToOne({ entity: () => Stakeholder, nullable: true })
    primaryActor?: Stakeholder;
}

export { Scenario };