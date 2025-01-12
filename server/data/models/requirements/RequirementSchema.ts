import { Collection, Entity, Enum, ManyToOne, OneToMany, OptionalProps, Property } from '@mikro-orm/core';
import { StaticAuditModel, VolatileAuditModel } from '../AuditSchema.js';
import { ReqType } from './ReqType.js';

// static properties
@Entity({ abstract: true, tableName: 'requirement', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementModel extends StaticAuditModel {
    [OptionalProps]?: 'req_type'

    @Enum({ items: () => ReqType, primary: true })
    readonly req_type!: ReqType;

    @Property({ type: 'uuid', primary: true })
    readonly id!: string;

    @OneToMany({ entity: () => RequirementVersionsModel, mappedBy: 'requirement' })
    readonly versions = new Collection<RequirementVersionsModel>(this);
}

//volatile properties
@Entity({ abstract: true, tableName: 'requirement_versions', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementVersionsModel extends VolatileAuditModel {
    [OptionalProps]?: 'req_type'

    @Enum({ items: () => ReqType, primary: true })
    readonly req_type!: ReqType;

    @ManyToOne({ entity: () => RequirementModel, primary: true })
    readonly requirement!: RequirementModel;

    @Property({ length: 100 })
    readonly name!: string

    @Property({ length: 1000 })
    readonly description!: string

    @Property({ type: 'string', nullable: true })
    readonly reqId?: `P.${number}.${number}` | `E.${number}.${number}` | `G.${number}.${number}` | `S.${number}.${number}` | `0.${number}.${number}` | undefined

    @Property({ default: false })
    readonly isSilence!: boolean
}