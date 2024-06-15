import Scenario from "./Scenario";
import type { Uuid } from "~/domain/Uuid";
import type { Properties } from "~/domain/Properties";

/**
 * A Use Case specifies the scenario of a complete 
 * interaction of a user through a system.
 */
export default class UseCase extends Scenario {
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
     * The preCondition is an Assumption that must be true before the use case can start.
     */
    preCondition: Uuid

    // the action upon the system that starts the use case
    // A Responsibility? Functional Requirement?
    trigger: Uuid

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
    successGuarantee: Uuid

    /**
     * 
     */
    // extensions: [FunctionalRequirement | Constraint | Role | Responsibility][]
    extensions: string

    /**
     * 
     */
    stakeHoldersAndInterests: Uuid[] // Actor[]

    constructor(props: Properties<UseCase>) {
        super(props)
        this.scope = props.scope
        this.level = props.level
        this.goalInContext = props.goalInContext
        this.preCondition = props.preCondition
        this.trigger = props.trigger
        this.mainSuccessScenario = props.mainSuccessScenario
        this.successGuarantee = props.successGuarantee
        this.extensions = props.extensions
        this.stakeHoldersAndInterests = props.stakeHoldersAndInterests
    }
}