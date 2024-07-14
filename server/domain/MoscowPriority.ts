import Entity from "./Entity";
import type { Properties } from "./Properties";

/**
 * Represents a MoSCoW priority.
 * @see https://en.wikipedia.org/wiki/MoSCoW_method
 */
export default class MoscowPriority extends Entity<string> {
    static MUST = new MoscowPriority({ id: 'MUST', description: 'Must have this' });
    static SHOULD = new MoscowPriority({ id: 'SHOULD', description: 'Should have this if at all possible' });
    static COULD = new MoscowPriority({ id: 'COULD', description: 'Could have this, but not necessary' });
    static WONT = new MoscowPriority({ id: 'WONT', description: 'Won\'t have this time but would like in the future' });

    /**
     * The description of the priority.
     */
    description: string;

    constructor({ description, id }: Properties<MoscowPriority>) {
        super({ id });
        this.description = description
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            description: this.description
        }
    }
}