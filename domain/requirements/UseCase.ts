import { Scenario } from "./Scenario.js";

/**
 * A Use Case specifies the scenario of a complete
 * interaction of a user through a system.
 */
export class UseCase extends Scenario {
    static override readonly reqIdPrefix = 'S.4.' as const;

    constructor(props: ConstructorParameters<typeof Scenario>[0] & Pick<UseCase, 'scope' | 'level' | 'preconditionId' | 'triggerId' | 'mainSuccessScenario' | 'successGuaranteeId' | 'extensions'>) {
        super(props);
        this.scope = props.scope;
        this.level = props.level;
        this.preconditionId = props.preconditionId;
        this.triggerId = props.triggerId;
        this.mainSuccessScenario = props.mainSuccessScenario;
        this.successGuaranteeId = props.successGuaranteeId;
        this.extensions = props.extensions;
        // this.stakeHoldersAndInterests = props.stakeHoldersAndInterests;
    }

    override get reqId() { return super.reqId as `${typeof UseCase.reqIdPrefix}${number}` | undefined }

    /**
     * The scope of the use case.
     */
    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    readonly scope: string;

    /**
     * The level of the use case.
     */
    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    readonly level: string;

    /**
     * The precondition is an Assumption that must be true before the use case can start.
     */
    readonly preconditionId: string;

    /**
     * The action upon the system that starts the use case.
     */
    readonly triggerId: string;

    /**
     * The main success scenario is the most common path through the system.
     * It takes the form of a sequence of steps that describe the interaction:
     * 1. The use case starts when <Actor> <does something>.
     * 2. The system <does something in response>.
     * 3. The <Actor name> does something else.
     * ...
     */
    //mainSuccessScenario: [FunctionalRequirement | Constraint | Role | Responsibility][]
    readonly mainSuccessScenario: string

    /**
     * An Effect that is guaranteed to be true after the use case is completed.
     */
    readonly successGuaranteeId: string;

    /**
     * Extensions of the use case.
     */
    // extensions: [FunctionalRequirement | Constraint | Role | Responsibility][]
    readonly extensions: string

    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    // stakeHoldersAndInterests: string[] // Actor[]

    override toJSON() {
        return {
            ...super.toJSON(),
            scope: this.scope,
            level: this.level,
            preconditionId: this.preconditionId,
            triggerId: this.triggerId,
            mainSuccessScenario: this.mainSuccessScenario,
            successGuaranteeId: this.successGuaranteeId,
            extensions: this.extensions,
            // stakeHoldersAndInterests: this.stakeHoldersAndInterests
        }
    }
}