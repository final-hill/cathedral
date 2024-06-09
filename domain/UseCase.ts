import Example from "./Example";
import type { Properties } from "./Properties";
import type { Uuid } from "./Uuid";

/**
 * A Use Case specifies the scenario of a complete 
 * interaction of a user through a system.
 */
export default class UseCase extends Example {
    constructor({ primaryActorId, ...rest }: Properties<UseCase>) {
        super(rest);

        this.primaryActorId = primaryActorId;
    }

    primaryActorId: Uuid;
}