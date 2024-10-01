import { Example, Stakeholder } from "./index.js";

/**
 * A Scenario specifies system behavior by describing paths
 * of interaction between actors and the system.
 */
export abstract class Scenario extends Example {
    constructor({ primaryActor, ...rest }: Omit<Scenario, 'id'>) {
        super(rest);
        this.primaryActor = primaryActor;
    }

    /**
     * Primary actor involved in the scenario
     */
    primaryActor?: Stakeholder;
}
