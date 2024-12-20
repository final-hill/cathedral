import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { ReqType } from '../../../../domain/requirements/index.js';
import { VersionedModel } from '../VersionedSchema.js';
import { AppUserModel } from '../application/AppUserSchema.js';

// static properties
@Entity({ abstract: true, tableName: 'requirement', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementModel {
    @Property({ type: 'uuid', primary: true })
    readonly id!: string;

    @ManyToOne({ entity: () => AppUserModel })
    readonly createdBy!: AppUserModel;

    @OneToMany({ entity: () => RequirementVersionsModel, mappedBy: 'requirement' })
    readonly versions = new Collection<RequirementVersionsModel>(this);
}

//volatile properties
@Entity({ abstract: true, tableName: 'requirement_versions', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementVersionsModel extends VersionedModel {
    @ManyToOne({ entity: () => RequirementModel, primary: true })
    readonly requirement!: RequirementModel;

    @Property({ length: 100 })
    readonly name!: string

    @Property({ length: 1000 })
    readonly description!: string

    @ManyToOne({ entity: () => AppUserModel })
    readonly modifiedBy!: AppUserModel;

    @Property({ type: 'string', nullable: true })
    readonly reqId?: `P.${number}.${number}` | `E.${number}.${number}` | `G.${number}.${number}` | `S.${number}.${number}` | `0.${number}.${number}` | undefined

    @Property({ default: false })
    readonly isSilence!: boolean

    // TODO: are mappedBy and inversedBy backwards?

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'BelongsVersionsModel', mappedBy: 'belongsTo' })
    contains = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'BelongsVersionsModel', inversedBy: 'contains' })
    belongsTo = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'CharacterizesVersionsModel', mappedBy: 'characterizedBy' })
    characterizes = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'CharacterizesVersionsModel', inversedBy: 'characterizes' })
    characterizedBy = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'ConstrainsVersionsModel', mappedBy: 'constrainedBy' })
    constrains = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'ConstrainsVersionsModel', inversedBy: 'constrains' })
    constrainedBy = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'ContradictsVersionsModel', mappedBy: 'contradictedBy' })
    contradicts = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'ContradictsVersionsModel', inversedBy: 'contradicts' })
    contradictedBy = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'DetailsVersionsModel', mappedBy: 'detailedBy' })
    details = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'DetailsVersionsModel', inversedBy: 'details' })
    detailedBy = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'DisjoinsVersionsModel', mappedBy: 'disjointedBy' })
    disjoins = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'DisjoinsVersionsModel', inversedBy: 'disjoins' })
    disjointedBy = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'DuplicatesVersionsModel', mappedBy: 'duplicatedBy' })
    duplicates = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'DuplicatesVersionsModel', inversedBy: 'duplicates' })
    duplicatedBy = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'ExceptsVersionsModel', mappedBy: 'exceptedBy' })
    excepts = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'ExceptsVersionsModel', inversedBy: 'excepts' })
    exceptedBy = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'ExplainsVersionsModel', mappedBy: 'explainedBy' })
    explains = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'ExplainsVersionsModel', inversedBy: 'explains' })
    explainedBy = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'ExtendsVersionsModel', mappedBy: 'extendedBy' })
    extends = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'ExtendsVersionsModel', inversedBy: 'extends' })
    extendedBy = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'FollowsVersionsModel', mappedBy: 'followedBy' })
    follows = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'FollowsVersionsModel', inversedBy: 'follows' })
    followedBy = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'RepeatsVersionsModel', mappedBy: 'repeatedBy' })
    repeats = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'RepeatsVersionsModel', inversedBy: 'repeats' })
    repeatedBy = new Collection<RequirementVersionsModel>(this);

    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'SharesVersionsModel', mappedBy: 'sharedBy' })
    shares = new Collection<RequirementVersionsModel>(this);
    @ManyToMany({ entity: 'RequirementVersionsModel', pivotEntity: 'SharesVersionsModel', inversedBy: 'shares' })
    sharedBy = new Collection<RequirementVersionsModel>(this);
}