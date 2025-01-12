import { AuditMetadata } from "../AuditMetadata";

/**
 * A Requirement is a statement that specifies a property.
 */
export class Requirement extends AuditMetadata {
    static readonly reqIdPrefix: `${'P' | 'E' | 'G' | 'S' | '0'}.${number}.` = '0.0.';

    constructor({ reqId, ...props }: Omit<Pick<Requirement, keyof Requirement>, 'reqId'> & { reqId?: Requirement['_reqId'] }) {
        super(props)
        if (props.name.length > 100)
            throw new Error('Name must be less than 100 characters')
        if (props.description.length > 1000)
            throw new Error('Description must be less than 1000 characters')

        this._reqId = reqId;
        this.id = props.id;
        this.name = props.name;
        this.description = props.description;
        this.isDeleted = props.isDeleted;
        this.isSilence = props.isSilence;
    }

    /**
     * The unique identifier of the Requirement
     */
    readonly id: string;

    private readonly _reqId?: `${typeof Requirement['reqIdPrefix']}${number}`

    /**
     * The user-friendly identifier of the requirement that is unique within its parent
     */
    // This is nullable because MetaRequirements, Silence, and Noise do not have a reqId
    // It may also be undefined if the requirement has not been added to a solution
    get reqId() { return this._reqId }

    // A property is a Predicate formalizing its associated statement.
    // see: https://github.com/final-hill/cathedral/issues/368
    // property!: string

    /**
     * A short name for the requirement
     * @throws {Error} if the name is longer than 100 characters
    */
    readonly name: string;

    /**
     * Whether the requirement is deleted
     */
    readonly isDeleted: boolean;

    /**
     * A human-readable explanation of a property
     * @throws {Error} if the description is longer than 1000 characters
    */
    readonly description: string;

    /**
     * Whether the requirement is a silence requirement.
     * (i.e. a requirement that is not included in the solution)
     */
    readonly isSilence: boolean;
}