import type { Properties } from '~/types/Properties.mjs';
import Entity from './Entity.mjs';

export default class System extends Entity {
    constructor(properties: Properties<System>) {
        super(properties);
    }
}