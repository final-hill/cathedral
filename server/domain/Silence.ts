import { Entity } from "@mikro-orm/core";
import { Requirement } from "./index.js";

/**
 * Propery that is not in requirements but should be
 */
@Entity()
class Silence extends Requirement {
    constructor(properties: Omit<Silence, 'id' | 'isSilence'>) {
        super({ ...properties, isSilence: true });
    }
}

export { Silence };