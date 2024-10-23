import { v7 as uuidv7 } from 'uuid';
import { BaseEntity, Entity, Enum, ManyToOne, OptionalProps, Property } from '@mikro-orm/core';
import { type Properties } from '../types/index.js';
import { ReqType } from './ReqType.js';
import { AppUser } from '../application/AppUser.js';

/**
 * A Requirement is a statement that specifies a property.
 */
@Entity({ abstract: true, discriminatorColumn: 'req_type' })
export abstract class Requirement extends BaseEntity {
    constructor(props: Properties<Omit<Requirement, 'id' | 'req_type'>>) {
        super()
        this.id = uuidv7();
        this.req_type = ReqType.REQUIREMENT;
        this.name = props.name;
        this.description = props.description;
        this.lastModified = props.lastModified;
        this.modifiedBy = props.modifiedBy;
        this.isSilence = props.isSilence;
    }

    // This fixes the issue with em.create not honoring the constructor signature
    // see: https://mikro-orm.io/docs/property-validation#properties-with-default-value
    [OptionalProps]?: 'req_type'

    @Enum(() => ReqType)
    req_type: ReqType

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
     * @throws {Error} if the name is longer than 100 characters
     */
    @Property({ type: 'string', length: 100 })
    name!: string;

    /**
     * A human-readable explanation of a property
     * @throws {Error} if the description is longer than 1000 characters
     */
    @Property({ type: 'string', length: 1000 })
    description!: string;

    /**
     * The date and time when the requirement was last modified
     */
    @Property({ type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date(), defaultRaw: 'now()' })
    lastModified!: Date;

    /**
     * The user who last modified the requirement
     */
    // System Admin is the default user for the initial migration
    // This can be removed in v0.14.0 or later
    @ManyToOne({ entity: () => AppUser, default: 'ac594919-50e3-438a-b9bc-efb8a8654243' })
    modifiedBy!: AppUser;

    /**
     * Whether the requirement is a silence requirement.
     * (i.e. a requirement that is not included in the solution)
     */
    @Property({ type: 'boolean', default: false })
    isSilence!: boolean;
}