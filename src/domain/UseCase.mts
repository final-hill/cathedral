import type { Properties } from '~/types/Properties.mjs';
import Behavior from './Behavior.mjs';
import type Stakeholder from './Stakeholder.mjs';

/**
 * A Use Case specifies a scenario of a complete interaction of an actor with a system.
 */
export default class UseCase extends Behavior {
    /**
     * The actor that is involved in the use case.
     */
    actor: Stakeholder;

    constructor({ actor, ...rest }: Properties<UseCase>) {
        super(rest);

        this.actor = actor;
    }
}