import { Entity } from "@mikro-orm/core";
import { Noise } from "./Noise.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * Design or implementation suggestion
 */
@Entity({ discriminatorValue: ReqType.HINT })
export class Hint extends Noise {
    constructor(props: Properties<Omit<Hint, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.HINT
    }
}