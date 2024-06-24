import Example from "../modules/system/domain/Example";
import type { Properties } from "~/domain/Properties";
import type { Uuid } from "~/domain/Uuid";

/**
 * A Scenario specifies system behavior by describing paths
 * of interaction between actors and the system.
 */
export default class Scenario extends Example {
    constructor({ primaryActorId, ...rest }: Properties<Scenario>) {
        super(rest);

        Object.assign(this, { primaryActorId });
    }

    primaryActorId!: Uuid
}