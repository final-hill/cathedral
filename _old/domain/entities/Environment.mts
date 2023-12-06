import Constraint from './Constraint.mjs';

/**
 * The set of entities (people, organizations, regulations, devices and other material objects, other systems)
 * external to the project or system but with the potential to affect it or be affected by it.
 */
export default class Environment {
    private _constraints: Constraint[] = [];

    /**
     * The requirements of the environment
     */
    get constraints(): Constraint[] { return this._constraints; }
}