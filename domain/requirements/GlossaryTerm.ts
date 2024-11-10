import { Entity } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * A word or phrase that is part of a glossary. Provides a definition for the term
 */
@Entity({ discriminatorValue: ReqType.GLOSSARY_TERM })
export class GlossaryTerm extends Component {
    static override reqIdPrefix = 'E.1.' as const;

    constructor(props: Properties<Omit<GlossaryTerm, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.GLOSSARY_TERM;
    }

    override get reqId() { return super.reqId as `${typeof GlossaryTerm.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}