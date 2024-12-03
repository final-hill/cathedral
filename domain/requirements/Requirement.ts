import { v7 as uuidv7 } from 'uuid';
import { BaseEntity, Collection, OptionalProps } from '@mikro-orm/core';
import { type Properties } from '../types/index.js';
import { ReqType } from './ReqType.js';
import { AppUser } from '../application/AppUser.js';

/**
 * A Requirement is a statement that specifies a property.
 */
export abstract class Requirement extends BaseEntity {
    static req_type: ReqType = ReqType.REQUIREMENT;
    static reqIdPrefix: `${'P' | 'E' | 'G' | 'S' | '0'}.${number}.` = '0.0.';

    constructor(props: Properties<Omit<Requirement, 'id' | 'req_type'>>) {
        super()
        this.id = uuidv7();
        this.req_type = (this.constructor as typeof Requirement).req_type;
        this.name = props.name;
        this.description = props.description;
        this.lastModified = props.lastModified;
        this.modifiedBy = props.modifiedBy;
        this.isSilence = props.isSilence;
        this.createdBy = props.createdBy;
        this._reqId = props.reqId;

        // The ORM can pass extra properties to the constructor
        if (Object.values(props).some((value) => (value as any) instanceof Collection))
            throw new Error('Collections cannot be passed to the Requirement constructor')
    }

    // This fixes the issue with em.create not honoring the constructor signature
    // see: https://mikro-orm.io/docs/property-validation#properties-with-default-value
    [OptionalProps]?: 'req_type' | 'slug'

    private _req_type!: ReqType;

    get req_type(): ReqType { return this._req_type }
    set req_type(value: ReqType) { this._req_type = value }

    /**
     * The unique identifier of the Requirement
     */
    id: string;

    // This is nullable because MetaRequirements, Silence, and Noise do not have a reqId
    // It may also be undefined if the requirement has not been added to a solution
    private _reqId?: `${typeof Requirement['reqIdPrefix']}${number}`

    /**
     * The user-friendly identifier of the requirement that is unique within its parent
     */
    get reqId() { return this._reqId }
    set reqId(value) { this._reqId = value }

    // A property is a Predicate formalizing its associated statement.
    // see: https://github.com/final-hill/cathedral/issues/368
    // property!: string

    private _name!: string;
    /**
     * A short name for the requirement
     * @throws {Error} if the name is longer than 100 characters
     */
    get name(): string { return this._name }
    set name(value: string) {
        if (value.length > 100) throw new Error('Name must be less than 100 characters')
        this._name = value
    }

    private _description!: string;
    /**
     * A human-readable explanation of a property
     * @throws {Error} if the description is longer than 1000 characters
     */
    get description(): string { return this._description }
    set description(value: string) {
        if (value.length > 1000) throw new Error('Description must be less than 1000 characters')
        this._description = value
    }

    /**
     * The date and time when the requirement was last modified
     */
    lastModified: Date;

    /**
     * The user who last modified the requirement
     */
    modifiedBy: AppUser;

    /**
     * The user who created the requirement
     */
    createdBy: AppUser;

    /**
     * Whether the requirement is a silence requirement.
     * (i.e. a requirement that is not included in the solution)
     */
    isSilence: boolean;

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////// Relations /////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    /**
     * this ⊆ other
     *
     * this is a sub-requirement of other; textually included
     */
    belongs = new Collection<Requirement>(this);

    /**
     * The inverse of {@link belongs}
     *
     * This is the set of requirements that are sub-requirements of this requirement
     */
    contains = new Collection<Requirement>(this);

    /**
     * this → other
     *
     * Meta-requirement this applies to other
     */
    // TODO: need to enforce that this is a MetaRequirement
    characterizes = new Collection<Requirement>(this);

    /**
     * The inverse of {@link characterizes}
     */
    // TODO: need to enforce that other is a MetaRequirement
    characterizedBy = new Collection<Requirement>(this);

    /**
     * this ▸ other
     *
     * Constraint this applies to other
     */
    // TODO: need to enforce that this is a Constraint
    constrains = new Collection<Requirement>(this);

    /**
     * The inverse of {@link constrains}
     */
    // TODO: need to enforce that other is a Constraint
    constrainedBy = new Collection<Requirement>(this);

    /**
     * this ⊕ other
     *
     * Properties specified by this and other cannot both hold
     */
    contradicts = new Collection<Requirement>(this);

    /**
     * The inverse of {@link contradicts}
     */
    contradictedBy = new Collection<Requirement>(this);

    /**
     * this » other
     *
     * this adds detail to properties of other
     */
    details = new Collection<Requirement>(this);

    /**
     * The inverse of {@link details}
     */
    detailedBy = new Collection<Requirement>(this);

    /**
     * this || other
     *
     * this and other are unrelated
     */
    disjoins = new Collection<Requirement>(this);

    /**
     * The inverse of {@link disjoins}
     */
    disjoinedBy = new Collection<Requirement>(this);

    /**
     * this ≡ other
     *
     * this ⇔ other, and this has the same type as other.
     * In other words, this and other are redundant.
     * Same properties, same type (notation-wise, this ≡ other)
     */
    duplicates = new Collection<Requirement>(this);

    /**
     * The inverse of {@link duplicates}
     */
    duplicatedBy = new Collection<Requirement>(this);

    /**
     * this \\ other
     *
     * this specifies an exception to the property specified by other.
     */
    excepts = new Collection<Requirement>(this);

    /**
     * The inverse of {@link excepts}
     */
    exceptedBy = new Collection<Requirement>(this);

    /**
     * this ≅ other
     *
     * this ⇔ other, and this has a different type from other.
     * In other words, other introduces no new property but helps understand this better.
     * Same properties, different type (notation-wise)
     */
    explains = new Collection<Requirement>(this);

    /**
     * The inverse of {@link explains}
     */
    explainedBy = new Collection<Requirement>(this);

    /**
     * this > other
     *
     * aka "refines".
     * this assumes other and specifies a property that other does not.
     * this adds to properties of other
     */
    extends = new Collection<Requirement>(this);

    /**
     * The inverse of {@link extends}
     */
    extendedBy = new Collection<Requirement>(this);

    /**
     * this ⊣ other
     *
     * this is a consequence of the property specified by other
     */
    follows = new Collection<Requirement>(this);

    /**
     * The inverse of {@link follows}
     */
    followedBy = new Collection<Requirement>(this);

    /**
     * this ⇔ other
     *
     * this specifies the same property as other
     */
    repeats = new Collection<Requirement>(this);

    /**
     * The inverse of {@link repeats}
     */
    repeatedBy = new Collection<Requirement>(this);

    /**
     * this ∩ other
     *
     * this' ⇔ other' for some sub-requirements this' and other' of this and other.
     * (Involve Repeats).
     * Some subrequirement is in common between this and other.
     */
    shares = new Collection<Requirement>(this);

    /**
     * The inverse of {@link shares}
     */
    sharedBy = new Collection<Requirement>(this);
}