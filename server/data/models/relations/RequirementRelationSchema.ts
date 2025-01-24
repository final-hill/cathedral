import { Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, OptionalProps, Ref } from '@mikro-orm/core';
import { RelType } from './RelType.js';
import { StaticAuditModel, VolatileAuditModel } from '../index.js';
import { RequirementModel } from '../requirements/index.js';

// Static properties
@Entity({ abstract: true, tableName: 'requirement_relation', discriminatorColumn: 'rel_type', discriminatorValue: RelType.RELATION })
export abstract class RequirementRelationModel extends StaticAuditModel {
    [OptionalProps]?: 'rel_type' | 'latestVersion'

    @Enum({ items: () => RelType, primary: true })
    readonly rel_type!: RelType

    @ManyToOne({ entity: 'RequirementModel', primary: true })
    readonly left!: RequirementModel

    @ManyToOne({ entity: 'RequirementModel', primary: true })
    readonly right!: RequirementModel

    @OneToMany({ entity: 'RequirementRelationVersionsModel', mappedBy: 'requirementRelation' })
    readonly versions = new Collection<RequirementRelationVersionsModel>(this)

    @OneToOne({
        entity: () => RequirementRelationVersionsModel,
        ref: true,
        // Select the latest version id of the requirement (effective_from <= now())
        formula: alias =>
            `select id
            from requirement_relation_versions
            where requirement_relation_id = ${alias}.id
            and effective_from <= now()
            and is_deleted = false
            order by effective_from
            desc limit 1`
    })
    readonly latestVersion?: Ref<RequirementRelationVersionsModel>
}

// Volatile properties
@Entity({
    abstract: true, tableName: 'requirement_relation_versions', discriminatorColumn: 'rel_type', discriminatorValue: RelType.RELATION
})
export abstract class RequirementRelationVersionsModel extends VolatileAuditModel {
    [OptionalProps]?: 'rel_type'

    @Enum({ items: () => RelType, primary: true })
    readonly rel_type!: RelType

    @ManyToOne({ entity: 'RequirementRelationModel', primary: true })
    readonly requirementRelation!: RequirementRelationModel
}