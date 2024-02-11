import type { Properties } from '~/types/Properties.mjs';
import { Behavior, type Stakeholder } from './index.mjs';
/**
 * A Use Case specifies a scenario of a complete interaction of an actor with a system.
 */
export class UseCase extends Behavior {
    /**
     * The actor that is involved in the use case.
     */
    actor: Stakeholder;

    constructor({ actor, ...rest }: Properties<UseCase>) {
        super(rest);

        this.actor = actor;
    }
}