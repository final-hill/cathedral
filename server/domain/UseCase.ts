import Scenario from "./Scenario.js";
import { type Uuid, emptyUuid } from "./Uuid.js";
import type { Properties } from "./Properties.js";
import Assumption from "./Assumption.js";
import Effect from "./Effect.js";

/**
 * A Use Case specifies the scenario of a complete
 * interaction of a user through a system.
 */
export default class UseCase extends Scenario {
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

    /**
     * TODO: <https://github.com/final-hill/cathedral/issues/154>
     */
    scope: string

    /**
     * TODO: <https://github.com/final-hill/cathedral/issues/154>
     */
    level: string

    /**
     * TODO: is this just the Goal.description?
     */
    goalInContext: string

    /**
     * The precondition is an Assumption that must be true before the use case can start.
     */
    precondition: Assumption

    // the action upon the system that starts the use case
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
    mainSuccessScenario: string

    /**
     * An Effect that is guaranteed to be true after the use case is completed.
     */
    successGuarantee: Effect

    /**
     *
     */
    // extensions: [FunctionalRequirement | Constraint | Role | Responsibility][]
    extensions: string

    /**
     *
     */
    // stakeHoldersAndInterests: Uuid[] // Actor[]

    override toJSON() {
        return {
            ...super.toJSON(),
            scope: this.scope,
            level: this.level,
            goalInContext: this.goalInContext,
            preconditionId: this.precondition.id,
            triggerId: this.triggerId,
            mainSuccessScenario: this.mainSuccessScenario,
            successGuaranteeId: this.successGuarantee.id,
            extensions: this.extensions
            // stakeHoldersAndInterests: this.stakeHoldersAndInterests
        }
    }
}