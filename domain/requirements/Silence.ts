import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Property that is not in requirements but should be
 */
export class Silence extends Requirement {
    static override req_type: ReqType = ReqType.SILENCE;

    constructor(props: Omit<ConstructorParameters<typeof Requirement>[0], 'isSilence'>) {
        super({ ...props, isSilence: true });
    }
}