import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Assumption, Effect, ParsedRequirement, Scenario } from "./index.js";

/**
 * A Use Case specifies the scenario of a complete
 * interaction of a user through a system.
 */
@Entity()
class UseCase extends Scenario {
    constructor(props: Omit<UseCase, 'id'>) {
        super(props);
        this.scope = props.scope;
        this.level = props.level;
        this.goalInContext = props.goalInContext;
        this.precondition = props.precondition;
        this.triggerId = props.triggerId;
        this.mainSuccessScenario = props.mainSuccessScenario;
        this.successGuarantee = props.successGuarantee;
        this.extensions = props.extensions;
        // this.stakeHoldersAndInterests = props.stakeHoldersAndInterests;
        this.follows = props.follows;
    }

    /**
     * Requirement that this use case follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;

    /**
     * The scope of the use case.
     */
    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    @Property({ type: 'string', nullable: false })
    scope: string;

    /**
     * The level of the use case.
     */
    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    @Property({ type: 'string', nullable: false })
    level: string;

    /**
     * The goal in context of the use case.
     */
    // TODO: is this just the Goal.description?
    @Property({ type: 'string', nullable: false })
    goalInContext: string;

    /**
     * The precondition is an Assumption that must be true before the use case can start.
     */
    @ManyToOne({ entity: () => Assumption, nullable: true })
    precondition?: Assumption;

    /**
     * The action upon the system that starts the use case.
     */
    @Property({ type: 'uuid', nullable: true })
    triggerId?: string;

    /**
     * The main success scenario is the most common path through the system.
     * It takes the form of a sequence of steps that describe the interaction:
     * 1. The use case starts when <Actor> <does something>.
     * 2. The system <does something in response>.
     * 3. The <Actor name> does something else.
     * ...
     */
    //mainSuccessScenario: [FunctionalRequirement | Constraint | Role | Responsibility][]
    @Property({ type: 'string', nullable: false })
    mainSuccessScenario: string

    /**
     * An Effect that is guaranteed to be true after the use case is completed.
     */
    @ManyToOne({ entity: () => Effect, nullable: true })
    successGuarantee?: Effect;

    /**
     * Extensions of the use case.
     */
    // extensions: [FunctionalRequirement | Constraint | Role | Responsibility][]
    @Property({ type: 'string', nullable: false })
    extensions: string

    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    // stakeHoldersAndInterests: string[] // Actor[]
}

export { UseCase };