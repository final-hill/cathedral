import { type Properties } from "../Properties.js";
import { Component } from "./index.js";

/**
 * A word or phrase that is part of a glossary. Provides a definition for the term
 */
export class GlossaryTerm extends Component {
    constructor({ parentComponent, ...rest }: Omit<Properties<GlossaryTerm>, 'id'>) {
        super(rest);
        this.parentComponent = parentComponent;
    }

    /**
     * The parent term of the glossary term, if any.
     */
    parentComponent?: GlossaryTerm;
}
