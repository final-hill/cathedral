import { Example } from "./Example.js";
import { Stakeholder } from "./Stakeholder.js";
import { Outcome } from "./Outcome.js";

/**
 * A Scenario specifies system behavior by describing paths
 * of interaction between actors and the system.
 */
export abstract class Scenario extends Example {
    constructor({ primaryActor, outcome, ...rest }: ConstructorParameters<typeof Example>[0] & Pick<Scenario, 'primaryActor' | 'outcome'>) {
        super(rest);
        this.primaryActor = primaryActor;
        this.outcome = outcome;
    }

    /**
     * Primary actor involved in the scenario
     */
    readonly primaryActor: Stakeholder;

    /**
     * The outcome (goal) that the scenario is aiming to achieve.
     */
    readonly outcome: Outcome;
}