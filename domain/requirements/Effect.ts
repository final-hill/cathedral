import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

export const effectReqIdPrefix = 'E.5.' as const;
export type EffectReqId = `${typeof effectReqIdPrefix}${number}`;

/**
 * Environment property affected by the system
 */
@Entity({ discriminatorValue: ReqType.EFFECT })
export class Effect extends Requirement {
    constructor(props: Properties<Omit<Effect, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.EFFECT;
    }

    override get reqId(): EffectReqId | undefined { return super.reqId as EffectReqId | undefined }
    override set reqId(value: EffectReqId | undefined) { super.reqId = value }
}