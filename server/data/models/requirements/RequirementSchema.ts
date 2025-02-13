import { Collection, Entity, Enum, ManyToOne, OneToMany, OptionalProps, PrimaryKey, Property, types } from '@mikro-orm/core';
import { StaticAuditModel, VolatileAuditModel } from '../index.js';
import { ReqType } from './ReqType.js';

// static properties
@Entity({ abstract: true, tableName: 'requirement', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementModel extends StaticAuditModel {
    [OptionalProps]?: 'req_type' | 'latestVersion'

    @Enum({ items: () => ReqType })
    readonly req_type!: ReqType;

    @PrimaryKey({ type: types.uuid })
    readonly id!: string;

    @OneToMany({ mappedBy: 'requirement', entity: () => RequirementVersionsModel })
    readonly versions = new Collection<RequirementVersionsModel>(this);

    /**
     * The latest version of the requirement (effective_from <= now())
     */
    get latestVersion(): Promise<RequirementVersionsModel | undefined> {
        return this.versions.loadItems({
            where: {
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            },
            orderBy: { effectiveFrom: 'desc' },
        }).then(items => items[0])
    }

}

//volatile properties
@Entity({ abstract: true, tableName: 'requirement_versions', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementVersionsModel extends VolatileAuditModel {
    [OptionalProps]?: 'req_type'

    @Enum({ items: () => ReqType })
    readonly req_type!: ReqType;

    @ManyToOne({ primary: true, entity: () => RequirementModel })
    readonly requirement!: RequirementModel;

    @Property({ type: types.string, length: 100 })
    readonly name!: string

    @Property({ type: types.string, length: 1000 })
    readonly description!: string

    @Property({ type: types.string, nullable: true })
    readonly reqId?: `P.${number}.${number}` | `E.${number}.${number}` | `G.${number}.${number}` | `S.${number}.${number}` | `0.${number}.${number}` | undefined

    @Property({ type: types.boolean, default: false })
    readonly isSilence!: boolean
}