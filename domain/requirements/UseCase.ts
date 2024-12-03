import { Assumption } from "./Assumption.js";
import { Effect } from "./Effect.js";
import { Scenario } from "./Scenario.js";
import { ReqType } from "./ReqType.js";

/**
 * A Use Case specifies the scenario of a complete
 * interaction of a user through a system.
 */
export class UseCase extends Scenario {
    static override reqIdPrefix = 'S.4.' as const;
    static override req_type = ReqType.USE_CASE;

    constructor(props: ConstructorParameters<typeof Scenario>[0] & Pick<UseCase, 'scope' | 'level' | 'precondition' | 'triggerId' | 'mainSuccessScenario' | 'successGuarantee' | 'extensions'>) {
        super(props);
        this.scope = props.scope;
        this.level = props.level;
        this.precondition = props.precondition;
        this.triggerId = props.triggerId;
        this.mainSuccessScenario = props.mainSuccessScenario;
        this.successGuarantee = props.successGuarantee;
        this.extensions = props.extensions;
        // this.stakeHoldersAndInterests = props.stakeHoldersAndInterests;
    }

    override get reqId() { return super.reqId as `${typeof UseCase.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }

    /**
     * The scope of the use case.
     */
    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    scope: string;

    /**
     * The level of the use case.
     */
    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    level: string;

    /**
     * The precondition is an Assumption that must be true before the use case can start.
     */
    precondition: Assumption;

    /**
     * The action upon the system that starts the use case.
     */
    triggerId: string;

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
    successGuarantee: Effect;

    /**
     * Extensions of the use case.
     */
    // extensions: [FunctionalRequirement | Constraint | Role | Responsibility][]
    extensions: string

    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    // stakeHoldersAndInterests: string[] // Actor[]
}