import { type Properties } from "../Properties.js";
import { Component } from "./index.js";

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
