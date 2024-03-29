import type { Properties } from '~/types/Properties.mjs';
import { Requirement } from './index.mjs';

/**
 * A Limit is a requirement describing a property that is out-of-scope.
 * Example: "Providing an interface to the user to change the color of the background is out-of-scope."
 */
export class Limit extends Requirement {
    constructor(properties: Properties<Limit>) {
        super(properties);
    }
}