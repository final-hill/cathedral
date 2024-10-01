import { Requirement } from "./index.js";

/**
 * Propery that is not in requirements but should be
 */
export class Silence extends Requirement {
    constructor(properties: Omit<Silence, 'id' | 'isSilence'>) {
        super({ ...properties, isSilence: true });
    }
}
