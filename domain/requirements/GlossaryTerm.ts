import { Component } from "./Component.js";

/**
 * A word or phrase that is part of a glossary. Provides a definition for the term
 */
export class GlossaryTerm extends Component {
    static override readonly reqIdPrefix = 'E.1.' as const;

    override get reqId() { return super.reqId as `${typeof GlossaryTerm.reqIdPrefix}${number}` | undefined }
}