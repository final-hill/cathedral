import type { Properties } from '~/types/Properties.mjs';
import { type Component, Entity } from './index.mjs';

/**
 * A System is a set of related artifacts that work together to
 * accomplish a common goal. Systems can be physical or software.
 */
export class System extends Entity {
    components!: Component[];

    constructor({ components, ...rest }: Properties<System>) {
        super(rest);
        this.components = components;
    }
}