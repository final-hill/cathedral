import { v7 as uuidv7 } from 'uuid';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { AppUser } from './AppUser.js';
import { Solution } from './Solution.js';

/**
 * A Requirement is a statement that specifies a property.
 */
@Entity({
    discriminatorColumn: 'req_type',
    abstract: true
})
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
    @Property({ type: 'uuid', primary: true })
    id: string;

    // A property is a Predicate formalizing its associated statement.
    // see: https://github.com/final-hill/cathedral/issues/368
    // property!: string

    /**
     * A short name for the requirement
     */
    @Property({ type: 'string' })
    name: string;

    /**
     * A human-readable description of a property
     * @throws {Error} if the statement is longer than 1000 characters
     */
    @Property({ type: 'string', length: 1000 })
    statement: string;

    /**
     * The solution that owns this requirement
     */
    @ManyToOne({ entity: () => Solution })
    solution: Solution;

    /**
     * The date and time when the requirement was last modified
     */
    @Property({ type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date(), defaultRaw: 'now()' })
    lastModified: Date;

    /**
     * The user who last modified the requirement
     */
    // System Admin is the default user for the initial migration
    // This can be removed in v0.14.0 or later
    @ManyToOne({ entity: () => AppUser, default: 'ac594919-50e3-438a-b9bc-efb8a8654243' })
    modifiedBy: AppUser;

    /**
     * Whether the requirement is a silence requirement.
     * (i.e. a requirement that is not included in the solution)
     */
    @Property({ type: 'boolean', default: false })
    isSilence: boolean;
}