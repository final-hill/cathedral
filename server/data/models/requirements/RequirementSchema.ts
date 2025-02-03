import { Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, OptionalProps, Property, type Ref } from '@mikro-orm/core';
import { StaticAuditModel, VolatileAuditModel } from '../index.js';
import { ReqType } from './ReqType.js';

// static properties
@Entity({ abstract: true, tableName: 'requirement', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementModel extends StaticAuditModel {
    [OptionalProps]?: 'req_type' | 'latestVersion'

    @Enum({ items: () => ReqType, primary: true })
    readonly req_type!: ReqType;

    @Property({ type: 'uuid', primary: true })
    readonly id!: string;

    @OneToMany({ entity: () => RequirementVersionsModel, mappedBy: 'requirement' })
    readonly versions = new Collection<RequirementVersionsModel>(this);

    @OneToOne({
        entity: () => RequirementVersionsModel,
        ref: true,
        formula: alias =>
            `select id
            from requirement_versions
            where requirement_id = ${alias}.id
            and effective_from <= now()
            and is_deleted = false
            order by effective_from
            desc limit 1`
    })
    readonly latestVersion?: Ref<RequirementVersionsModel>;
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