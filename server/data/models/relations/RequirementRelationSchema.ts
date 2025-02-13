import { Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, OptionalProps, type Ref } from '@mikro-orm/core';
import { RelType } from './RelType.js';
import { StaticAuditModel, VolatileAuditModel } from '../index.js';
import { RequirementModel } from '../requirements/index.js';

// Static properties
@Entity({ abstract: true, tableName: 'requirement_relation', discriminatorColumn: 'rel_type', discriminatorValue: RelType.RELATION })
export abstract class RequirementRelationModel extends StaticAuditModel {
    [OptionalProps]?: 'rel_type' | 'latestVersion'

    @Enum({ items: () => RelType })
    readonly rel_type!: RelType

    @ManyToOne({ primary: true, entity: () => RequirementModel })
    readonly left!: Ref<RequirementModel>

    @ManyToOne({ primary: true, entity: () => RequirementModel })
    readonly right!: Ref<RequirementModel>

    @OneToMany({ mappedBy: 'requirementRelation', entity: () => RequirementRelationVersionsModel })
    readonly versions = new Collection<RequirementRelationVersionsModel>(this)

    /**
     * The latest version of the relation (effective_from <= now())
     */
    get latestVersion(): Promise<RequirementRelationVersionsModel | undefined> {
        return this.versions.loadItems({
            where: {
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            },
            orderBy: { effectiveFrom: 'desc' },
        }).then(items => items[0])
    }
}

// Volatile properties
@Entity({
    abstract: true, tableName: 'requirement_relation_versions', discriminatorColumn: 'rel_type', discriminatorValue: RelType.RELATION
})
export abstract class RequirementRelationVersionsModel extends VolatileAuditModel {
    [OptionalProps]?: 'rel_type'

    @Enum({ items: () => RelType, primary: true })
    readonly rel_type!: RelType

    @ManyToOne({ primary: true, entity: () => RequirementRelationModel })
    readonly requirementRelation!: RequirementRelationModel
}