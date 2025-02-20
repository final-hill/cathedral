import { Requirement } from "./Requirement.js";

/**
 * Property that is not in requirements but should be
 */
export class Silence extends Requirement {
    constructor(props: Omit<ConstructorParameters<typeof Requirement>[0], 'isSilence'>) {
        super({ ...props, isSilence: true });
    }
}