import { v7 as uuidv7 } from 'uuid';
import { AppUser, Solution } from '../application/index.js';

/**
 * A Requirement is a statement that specifies a property.
 */
export abstract class Requirement {
    constructor(props: Omit<Requirement, 'id'>) {
        this.id = uuidv7();
        this.name = props.name;
        this.statement = props.statement;
        this.solution = props.solution;
        this.lastModified = props.lastModified;
        this.modifiedBy = props.modifiedBy;
        this.isSilence = props.isSilence;
    }

    /**
     * The unique identifier of the Requirement
     */
    id: string;

    // A property is a Predicate formalizing its associated statement.
    // see: https://github.com/final-hill/cathedral/issues/368
    // property!: string

    /**
     * A short name for the requirement
     */
    name: string;

    /**
     * A human-readable description of a property
     */
    statement: string;

    /**
     * The solution that owns this requirement
     */
    solution: Solution;

    /**
     * The date and time when the requirement was last modified
     */
    lastModified: Date;

    /**
     * The user who last modified the requirement
     */
    modifiedBy: AppUser;

    /**
     * Whether the requirement is a silence requirement.
     * (i.e. a requirement that is not included in the solution)
     */
    isSilence: boolean;
}
