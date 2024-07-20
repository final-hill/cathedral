import { Entity, ManyToOne } from "@mikro-orm/core";
import Component from "./Component.js";

@Entity()
export default class EnvironmentComponent extends Component {
    constructor({ parentComponent, ...rest }: Omit<EnvironmentComponent, 'id'>) {
        super(rest)
        this.parentComponent = parentComponent
    }

    @ManyToOne()
    parentComponent?: EnvironmentComponent
}
