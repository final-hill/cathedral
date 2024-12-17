import { Collection, Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
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
}