import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";

/**
 * Propery that is not in requirements but should be
 */
@Entity()
export class Silence extends Requirement {
    constructor(properties: Omit<Silence, 'id' | 'isSilence'>) {
        super({ ...properties, isSilence: true });
    }
}