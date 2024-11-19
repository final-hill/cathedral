import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * Propery that is not in requirements but should be
 */
@Entity({ discriminatorValue: ReqType.SILENCE })
export class Silence extends Requirement {
    static override req_type: ReqType = ReqType.SILENCE;

    constructor(props: Properties<Omit<Silence, 'id' | 'isSilence' | 'req_type'>>) {
        super({ ...props, isSilence: true });
    }
}