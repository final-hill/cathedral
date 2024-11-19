import { Entity, ManyToOne } from "@mikro-orm/core";
import { Scenario } from "./Scenario.js";
import { ReqType } from "./ReqType.js";
import type { Properties } from "../types/index.js";
import { FunctionalBehavior } from "./FunctionalBehavior.js";

/**
 * An Epic is a collection of Use Cases and User Stories all directed towards a common goal.
 * Ex: "decrease the percentage of of fraudulent sellers by 20%"
 */
@Entity({ discriminatorValue: ReqType.EPIC })
export class Epic extends Scenario {
    static override reqIdPrefix = 'G.5.' as const;
    static override req_type = ReqType.EPIC;

    constructor(props: Properties<Omit<Epic, 'id' | 'req_type'>>) {
        super(props);
        this.functionalBehavior = props.functionalBehavior;
    }

    override get reqId() { return super.reqId as `${typeof Epic.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }

    private _functionalBehavior?: FunctionalBehavior;

    /**
     * The action that the user wants to perform.
     */
    @ManyToOne({ entity: () => FunctionalBehavior })
    get functionalBehavior(): FunctionalBehavior | undefined { return this._functionalBehavior; }
    set functionalBehavior(value: FunctionalBehavior | undefined) { this._functionalBehavior = value; }
}