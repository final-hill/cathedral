import type { Properties } from '~/types/Properties.mjs';
import Requirement from './Requirement.mjs';

/**
 * An Effect is an environment property affected by a System.
 */
export default class Effect extends Requirement {
    constructor(properties: Properties<Effect>) {
        super(properties);
    }
}