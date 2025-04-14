import { Collection, Entity, Enum, ManyToOne, OneToMany, OptionalProps, PrimaryKey, Property, types } from '@mikro-orm/core';
import { StaticAuditModel, VolatileAuditModel } from '../index.js';
import { ReqType } from '../../../../shared/domain/requirements/ReqType.js';
import { type ReqId } from '../../../../shared/domain/requirements/Requirement.js';

// static properties
@Entity({ abstract: true, tableName: 'requirement', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementModel extends StaticAuditModel<RequirementVersionsModel> {
    [OptionalProps]?: 'req_type'

    @Enum({ items: () => ReqType })
    readonly req_type!: ReqType;

    @PrimaryKey({ type: types.uuid })
    readonly id!: string;

    @OneToMany(() => RequirementVersionsModel, (e) => e.requirement, { orderBy: { effectiveFrom: 'desc' } })
    readonly versions = new Collection<RequirementVersionsModel>(this);
}

//volatile properties
@Entity({ abstract: true, tableName: 'requirement_versions', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementVersionsModel extends VolatileAuditModel {
    [OptionalProps]?: 'req_type'

    @Enum({ items: () => ReqType })
    readonly req_type!: ReqType;

    @ManyToOne({ primary: true, entity: () => RequirementModel })
    readonly requirement!: RequirementModel;

    /**
     * The solution that this requirement belongs to.
     * This is nullable because an Organization and Solution are both requirements but do not have an owning solution.
     */
    @ManyToOne({ entity: () => RequirementModel, nullable: true })
    readonly solution?: RequirementModel;

    @Property({ type: types.string, length: 100 })
    readonly name!: string

    @Property({ type: types.string, length: 1000 })
    readonly description!: string

    @Property({ type: types.string, nullable: true })
    readonly reqId?: ReqId
}