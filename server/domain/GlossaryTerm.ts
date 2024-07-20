import { Entity, ManyToOne } from "@mikro-orm/core";
import Component from "./Component.js";

@Entity()
export default class GlossaryTerm extends Component {
    constructor({ parentComponent, ...rest }: Omit<GlossaryTerm, 'id'>) {
        super(rest)
        this.parentComponent = parentComponent
    }

    @ManyToOne()
    parentComponent?: GlossaryTerm;
}