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
    static reqIdPrefix: `${'P' | 'E' | 'G' | 'S' | '0'}.${number}.` = '0.0.';

    constructor(props: Properties<Omit<Requirement, 'id' | 'req_type'>>) {
        super()
        this.id = uuidv7();
        this.req_type = ReqType.REQUIREMENT;
        this.name = props.name;
        this.description = props.description;
        this.lastModified = props.lastModified;
        this.modifiedBy = props.modifiedBy;
        this.isSilence = props.isSilence;
        this.createdBy = props.createdBy;
        this._reqId = props.reqId;
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

    // This is nullable because MetaRequirements, Silence, and Noise do not have a reqId
    // It may also be undefined if the requirement has not been added to a solution
    private _reqId?: `${typeof Requirement['reqIdPrefix']}${number}`

    /**
     * The user-friendly identifier of the requirement that is unique within its parent
     */
    @Property({ type: 'text', nullable: true })
    get reqId() { return this._reqId }
    set reqId(value) { this._reqId = value }

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
    @ManyToOne({ entity: () => AppUser })
    modifiedBy!: AppUser;

    /**
     * The user who created the requirement
     */
    @ManyToOne({ entity: () => AppUser })
    createdBy!: AppUser;

    /**
     * Whether the requirement is a silence requirement.
     * (i.e. a requirement that is not included in the solution)
     */
    @Property({ type: 'boolean', default: false })
    isSilence!: boolean;
}