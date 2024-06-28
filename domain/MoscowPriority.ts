import Entity from "./Entity";
import type { Properties } from "./Properties";

/**
 * Represents a MoSCoW priority.
 * @see https://en.wikipedia.org/wiki/MoSCoW_method
 */
export default class MoscowPriority extends Entity<string> {
    static MUST = new MoscowPriority({ id: 'M', description: 'Must have this' });
    static SHOULD = new MoscowPriority({ id: 'S', description: 'Should have this if at all possible' });
    static COULD = new MoscowPriority({ id: 'C', description: 'Could have this, but not necessary' });
    static WONT = new MoscowPriority({ id: 'W', description: 'Won\'t have this time but would like in the future' });

    /**
     * The description of the priority.
     */
    description: string;

    constructor({ description, id }: Properties<MoscowPriority>) {
        super({ id });
        this.description = description
    }
}