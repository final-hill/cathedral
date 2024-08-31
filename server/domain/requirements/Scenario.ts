import { type Properties } from "../Properties.js";
import { Example, Stakeholder } from "./index.js";

/**
 * A Scenario specifies system behavior by describing paths
 * of interaction between actors and the system.
 */
export abstract class Scenario extends Example {
    constructor({ primaryActor, ...rest }: Omit<Properties<Scenario>, 'id'>) {
        super(rest);
        this.primaryActor = primaryActor;
    }

    primaryActor: Stakeholder

    override toJSON() {
        return {
            ...super.toJSON(),
            primaryActorId: this.primaryActor.id
        }
    }
}