import Component from "./Component.js";
import { type Properties } from "../Properties.js";

export default class EnvironmentComponent extends Component {
    constructor({ parentComponent, ...rest }: Omit<Properties<EnvironmentComponent>, 'id'>) {
        super(rest)
        this.parentComponent = parentComponent
    }

    parentComponent?: EnvironmentComponent

    override toJSON() {
        return {
            ...super.toJSON(),
            parentComponentId: this.parentComponent?.id
        }
    }
}