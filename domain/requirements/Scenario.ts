import { Example } from "./Example.js";

/**
 * A Scenario specifies system behavior by describing paths
 * of interaction between actors and the system.
 */
export abstract class Scenario extends Example {
    constructor({ primaryActorId, outcomeId, ...rest }: ConstructorParameters<typeof Example>[0] & Pick<Scenario, 'primaryActorId' | 'outcomeId'>) {
        super(rest);
        this.primaryActorId = primaryActorId;
        this.outcomeId = outcomeId;
    }

    /**
     * Primary actor involved in the scenario
     */
    readonly primaryActorId: string;

    /**
     * The outcome (goal) that the scenario is aiming to achieve.
     */
    readonly outcomeId: string;
}