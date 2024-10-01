import { Component, ParsedRequirement } from "./index.js";

/**
 * A word or phrase that is part of a glossary. Provides a definition for the term
 */
export class GlossaryTerm extends Component {
    constructor({ parentComponent, follows, ...rest }: Omit<GlossaryTerm, 'id'>) {
        super(rest);
        this.parentComponent = parentComponent;
        this.follows = follows;
    }

    /**
     * The parent term of the glossary term, if any.
     */
    parentComponent?: GlossaryTerm;

    /**
     * Requirement that this glossary term follows from
     */
    follows?: ParsedRequirement;
}
