import Requirement from './Requirement.mjs';

/**
 * A set of related artifacts, devised to help meet certain goals.
 */
export default class System {
    private _requirements: Requirement[] = [];
    get requirements(): Requirement[] { return this._requirements; }
}