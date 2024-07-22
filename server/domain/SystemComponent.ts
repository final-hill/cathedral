import Component from "./Component.js"
import { type Properties } from "./Properties.js";

export default class SystemComponent extends Component {
    constructor({ parentComponent, ...rest }: Omit<Properties<SystemComponent>, 'id'>) {
        super(rest)
        this.parentComponent = parentComponent
    }

    parentComponent?: SystemComponent;

    override toJSON() {
        return {
            ...super.toJSON(),
            parentComponentId: this.parentComponent?.id
        }
    }
}