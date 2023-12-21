import type { Properties } from '~/types/Properties.mjs';
import Requirement from './Requirement.mjs';

/**
 * A Behavior is a specification of how a system produces an outcome or effect.
 */
export default class Behavior extends Requirement {
    constructor(options: Properties<Behavior>) {
        super(options);
    }
}