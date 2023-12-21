import type { Properties } from '~/types/Properties.mjs';
import type { Uuid } from '~/types/Uuid.mjs';
import Behavior from './Behavior.mjs';

/**
 * A Use Case specifies a scenario of a complete interaction of an actor with a system.
 */
export default class UseCase extends Behavior {
    /**
     * The actor that is involved in the use case.
     */
    actor: Uuid;

    constructor(properties: Properties<UseCase>) {
        super(properties);

        this.actor = properties.actor;
    }
}