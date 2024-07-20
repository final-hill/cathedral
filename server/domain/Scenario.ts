import { ManyToOne } from "@mikro-orm/core";
import Example from "./Example.js";
import { type Properties } from "./Properties.js";
import Stakeholder from "./Stakeholder.js";

/**
 * A Scenario specifies system behavior by describing paths
 * of interaction between actors and the system.
 */
export default abstract class Scenario extends Example {
    constructor({ primaryActor, ...rest }: Omit<Properties<Scenario>, 'id'>) {
        super(rest);
        this.primaryActor = primaryActor;
    }

    @ManyToOne()
    primaryActor: Stakeholder
}