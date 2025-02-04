import { Collection, Entity, Enum, Formula, ManyToOne, OneToMany, OneToOne, OptionalProps, type Ref } from '@mikro-orm/core';
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

    // Select the latest version id of the requirement (effective_from <= now())
    @Formula(alias =>
        `select left, right, effective_from
        from requirement_relation_versions
        where requirement_relation_id = ${alias}.id
        and effective_from <= now()
        and is_deleted = false
        order by effective_from
        desc limit 1`
    )
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

    @ManyToOne({ primary: true, entity: () => RequirementRelationModel })
    readonly requirementRelation!: RequirementRelationModel
}