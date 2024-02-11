import type { Properties } from '~/types/Properties.mjs';
import { Requirement } from './index.mjs';

/**
 * An Effect is an environment property affected by a System.
 */
export class Effect extends Requirement {
    constructor(properties: Properties<Effect>) {
        super(properties);
    }
}