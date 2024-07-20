import { Entity, ManyToOne } from "@mikro-orm/core";
import Component from "./Component.js"

@Entity()
export default class SystemComponent extends Component {
    constructor({ parentComponent, ...rest }: Omit<SystemComponent, 'id'>) {
        super(rest)
        this.parentComponent = parentComponent
    }

    @ManyToOne()
    parentComponent?: SystemComponent;
}