import type { Properties } from '~/types/Properties.mjs';
import type Component from './Component.mjs';
import Entity from './Entity.mjs';

/**
 * A System is a set of related artifacts that work together to
 * accomplish a common goal. Systems can be physical or software.
 */
export default class System extends Entity {
    components!: Component[];

    constructor({ components, ...rest }: Properties<System>) {
        super(rest);
        this.components = components;
    }
}