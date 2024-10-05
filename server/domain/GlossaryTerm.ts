import { Entity, ManyToOne } from "@mikro-orm/core";
import { Component, ParsedRequirement } from "./index.js";

/**
 * A word or phrase that is part of a glossary. Provides a definition for the term
 */
@Entity()
class GlossaryTerm extends Component {
    constructor({ parentComponent, follows, ...rest }: Omit<GlossaryTerm, 'id' | 'sysPeriod'>) {
        super(rest);
        this.parentComponent = parentComponent;
        this.follows = follows;
    }

    /**
     * The parent term of the glossary term, if any.
     */
    @ManyToOne({ entity: () => GlossaryTerm, nullable: true })
    parentComponent?: GlossaryTerm;

    /**
     * Requirement that this glossary term follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}

export { GlossaryTerm }