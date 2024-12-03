import { Component } from "./Component.js";
import { ReqType } from "./ReqType.js";

/**
 * A word or phrase that is part of a glossary. Provides a definition for the term
 */
export class GlossaryTerm extends Component {
    static override reqIdPrefix = 'E.1.' as const;
    static override req_type = ReqType.GLOSSARY_TERM;

    override get reqId() { return super.reqId as `${typeof GlossaryTerm.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}