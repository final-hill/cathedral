import { type Properties } from "../Properties.js";
import Component from "./Component.js";

export default class GlossaryTerm extends Component {
    constructor({ parentComponent, ...rest }: Omit<Properties<GlossaryTerm>, 'id'>) {
        super(rest)
        this.parentComponent = parentComponent
    }

    parentComponent?: GlossaryTerm
}