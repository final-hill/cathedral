import Component from "./Component.js";
import { type Properties } from "./Properties.js";

/**
 * A GlossaryTerm is a word or phrase that is used in a specific domain and has a specific meaning
 */
export default class GlossaryTerm extends Component {
    constructor({ parentComponent, ...rest }: Omit<Properties<GlossaryTerm>, 'id'>) {
        super(rest)
        this.parentComponent = parentComponent
    }

    parentComponent?: GlossaryTerm;

    override toJSON() {
        return {
            ...super.toJSON(),
            parentComponentId: this.parentComponent?.id
        }
    }
}