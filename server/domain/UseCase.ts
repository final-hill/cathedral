import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import Scenario from "./Scenario.js";
import { type Uuid, emptyUuid } from "./Uuid.js";
import type { Properties } from "./Properties.js";
import Assumption from "./Assumption.js";
import Effect from "./Effect.js";

/**
 * A Use Case specifies the scenario of a complete
 * interaction of a user through a system.
 */
@Entity()
export default class UseCase extends Scenario {
    /**
     * TODO: <https://github.com/final-hill/cathedral/issues/154>
     */
    @Property()
    scope: string

    /**
     * TODO: <https://github.com/final-hill/cathedral/issues/154>
     */
    @Property()
    level: string

    /**
     * TODO: is this just the Goal.description?
     */
    @Property()
    goalInContext: string

    /**
     * The precondition is an Assumption that must be true before the use case can start.
     */
    @ManyToOne()
    precondition: Assumption

    // the action upon the system that starts the use case
    @Property()
    triggerId: Uuid = emptyUuid

    /**
     * The main success scenario is the most common path through the system.
     * It takes the form of a sequence of steps that describe the interaction:
     * 1. The use case starts when <Actor> <does something>.
     * 2. The system <does something in response>.
     * 3. The <Actor name> does something else.
     * ...
     */
    //mainSuccessScenario: [FunctionalRequirement | Constraint | Role | Responsibility][]
    @Property()
    mainSuccessScenario: string

    /**
     * An Effect that is guaranteed to be true after the use case is completed.
     */
    @ManyToOne()
    successGuarantee: Effect

    /**
     *
     */
    // extensions: [FunctionalRequirement | Constraint | Role | Responsibility][]
    @Property()
    extensions: string

    /**
     *
     */
    // stakeHoldersAndInterests: Uuid[] // Actor[]

    constructor(props: Omit<Properties<UseCase>, 'id'>) {
        super(props)
        this.scope = props.scope
        this.level = props.level
        this.goalInContext = props.goalInContext
        this.precondition = props.precondition
        this.triggerId = props.triggerId
        this.mainSuccessScenario = props.mainSuccessScenario
        this.successGuarantee = props.successGuarantee
        this.extensions = props.extensions
        // this.stakeHoldersAndInterests = props.stakeHoldersAndInterests
    }
}