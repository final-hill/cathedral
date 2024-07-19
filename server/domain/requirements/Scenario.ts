import Example from "./Example";
import { type Properties } from "../Properties";
import { type Uuid } from "../Uuid";

/**
 * A Scenario specifies system behavior by describing paths
 * of interaction between actors and the system.
 */
export default class Scenario extends Example {
    primaryActorId: Uuid

    constructor({ primaryActorId, ...rest }: Properties<Scenario>) {
        super(rest);
        this.primaryActorId = primaryActorId;
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            primaryActorId: this.primaryActorId
        }
    }
}