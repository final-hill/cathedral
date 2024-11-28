import { v7 as uuidv7 } from 'uuid';
import { BaseEntity, Collection, Entity, Enum, ManyToMany, ManyToOne, OptionalProps, Property } from '@mikro-orm/core';
import { type CollectionPropsToOptionalArrays, type Properties } from '../types/index.js';
import { ReqType } from './ReqType.js';
import { AppUser } from '../application/AppUser.js';
import { Belongs, Characterizes, Constrains, Contradicts, Details, Disjoins, Duplicates, Excepts, Explains, Extends, Follows, Repeats, Shares } from '../relations/index.js';

/**
 * A Requirement is a statement that specifies a property.
 */
@Entity({ abstract: true, discriminatorColumn: 'req_type' })
export abstract class Requirement extends BaseEntity {
    static req_type: ReqType = ReqType.REQUIREMENT;
    static reqIdPrefix: `${'P' | 'E' | 'G' | 'S' | '0'}.${number}.` = '0.0.';

    constructor(props: CollectionPropsToOptionalArrays<Properties<Omit<Requirement, 'id' | 'req_type'>>>) {
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

        for (const [key, value] of Object.entries(props)) {
            if (Array.isArray(value))
                (this[key as keyof this] as Collection<Requirement>) = new Collection(this, value);
        }
    }

    // This fixes the issue with em.create not honoring the constructor signature
    // see: https://mikro-orm.io/docs/property-validation#properties-with-default-value
    [OptionalProps]?: 'req_type' | 'slug'

    private _req_type!: ReqType;
    @Enum(() => ReqType)
    get req_type(): ReqType { return this._req_type }
    set req_type(value: ReqType) { this._req_type = value }

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

    private _name!: string;
    /**
     * A short name for the requirement
     * @throws {Error} if the name is longer than 100 characters
     */
    @Property({ type: 'string', length: 100 })
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
    @Property({ type: 'string', length: 1000 })
    get description(): string { return this._description }
    set description(value: string) {
        if (value.length > 1000) throw new Error('Description must be less than 1000 characters')
        this._description = value
    }

    /**
     * The date and time when the requirement was last modified
     */
    @Property({ type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date(), defaultRaw: 'now()' })
    lastModified: Date;

    /**
     * The user who last modified the requirement
     */
    @ManyToOne({ entity: () => AppUser })
    modifiedBy: AppUser;

    /**
     * The user who created the requirement
     */
    @ManyToOne({ entity: () => AppUser })
    createdBy: AppUser;

    /**
     * Whether the requirement is a silence requirement.
     * (i.e. a requirement that is not included in the solution)
     */
    @Property({ type: 'boolean', default: false })
    isSilence: boolean;

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////// Relations /////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    /**
     * this ⊆ other
     *
     * this is a sub-requirement of other; textually included
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Belongs, inversedBy: (r) => r.contains })
    belongs = new Collection<Requirement>(this);

    /**
     * The inverse of {@link belongs}
     *
     * This is the set of requirements that are sub-requirements of this requirement
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Belongs, mappedBy: (r) => r.belongs })
    contains = new Collection<Requirement>(this);

    /**
     * this → other
     *
     * Meta-requirement this applies to other
     */
    // TODO: need to enforce that this is a MetaRequirement
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Characterizes, inversedBy: (r) => r.characterizedBy })
    characterizes = new Collection<Requirement>(this);

    /**
     * The inverse of {@link characterizes}
     */
    // TODO: need to enforce that other is a MetaRequirement
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Characterizes, mappedBy: (r) => r.characterizes })
    characterizedBy = new Collection<Requirement>(this);

    /**
     * this ▸ other
     *
     * Constraint this applies to other
     */
    // TODO: need to enforce that this is a Constraint
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Constrains, inversedBy: (r) => r.constrainedBy })
    constrains = new Collection<Requirement>(this);

    /**
     * The inverse of {@link constrains}
     */
    // TODO: need to enforce that other is a Constraint
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Constrains, mappedBy: (r) => r.constrains })
    constrainedBy = new Collection<Requirement>(this);

    /**
     * this ⊕ other
     *
     * Properties specified by this and other cannot both hold
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Contradicts, inversedBy: (r) => r.contradictedBy })
    contradicts = new Collection<Requirement>(this);

    /**
     * The inverse of {@link contradicts}
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Contradicts, mappedBy: (r) => r.contradicts })
    contradictedBy = new Collection<Requirement>(this);

    /**
     * this » other
     *
     * this adds detail to properties of other
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Details, inversedBy: (r) => r.detailedBy })
    details = new Collection<Requirement>(this);

    /**
     * The inverse of {@link details}
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Details, mappedBy: (r) => r.details })
    detailedBy = new Collection<Requirement>(this);

    /**
     * this || other
     *
     * this and other are unrelated
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Disjoins, inversedBy: (r) => r.disjoinedBy })
    disjoins = new Collection<Requirement>(this);

    /**
     * The inverse of {@link disjoins}
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Disjoins, mappedBy: (r) => r.disjoins })
    disjoinedBy = new Collection<Requirement>(this);

    /**
     * this ≡ other
     *
     * this ⇔ other, and this has the same type as other.
     * In other words, this and other are redundant.
     * Same properties, same type (notation-wise, this ≡ other)
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Duplicates, inversedBy: (r) => r.duplicatedBy })
    duplicates = new Collection<Requirement>(this);

    /**
     * The inverse of {@link duplicates}
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Duplicates, mappedBy: (r) => r.duplicates })
    duplicatedBy = new Collection<Requirement>(this);

    /**
     * this \\ other
     *
     * this specifies an exception to the property specified by other.
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Excepts, inversedBy: (r) => r.exceptedBy })
    excepts = new Collection<Requirement>(this);

    /**
     * The inverse of {@link excepts}
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Excepts, mappedBy: (r) => r.excepts })
    exceptedBy = new Collection<Requirement>(this);

    /**
     * this ≅ other
     *
     * this ⇔ other, and this has a different type from other.
     * In other words, other introduces no new property but helps understand this better.
     * Same properties, different type (notation-wise)
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Explains, inversedBy: (r) => r.explainedBy })
    explains = new Collection<Requirement>(this);

    /**
     * The inverse of {@link explains}
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Explains, mappedBy: (r) => r.explains })
    explainedBy = new Collection<Requirement>(this);

    /**
     * this > other
     *
     * aka "refines".
     * this assumes other and specifies a property that other does not.
     * this adds to properties of other
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Extends, inversedBy: (r) => r.extendedBy })
    extends = new Collection<Requirement>(this);

    /**
     * The inverse of {@link extends}
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Extends, mappedBy: (r) => r.extends })
    extendedBy = new Collection<Requirement>(this);

    /**
     * this ⊣ other
     *
     * this is a consequence of the property specified by other
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Follows, inversedBy: (r) => r.followedBy })
    follows = new Collection<Requirement>(this);

    /**
     * The inverse of {@link follows}
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Follows, mappedBy: (r) => r.follows })
    followedBy = new Collection<Requirement>(this);

    /**
     * this ⇔ other
     *
     * this specifies the same property as other
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Repeats, inversedBy: (r) => r.repeatedBy })
    repeats = new Collection<Requirement>(this);

    /**
     * The inverse of {@link repeats}
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Repeats, mappedBy: (r) => r.repeats })
    repeatedBy = new Collection<Requirement>(this);

    /**
     * this ∩ other
     *
     * this' ⇔ other' for some sub-requirements this' and other' of this and other.
     * (Involve Repeats).
     * Some subrequirement is in common between this and other.
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Shares, inversedBy: (r) => r.sharedBy })
    shares = new Collection<Requirement>(this);

    /**
     * The inverse of {@link shares}
     */
    @ManyToMany({ entity: () => Requirement, pivotEntity: () => Shares, mappedBy: (r) => r.shares })
    sharedBy = new Collection<Requirement>(this);
}