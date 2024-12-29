import { Collection, Entity, ManyToOne, OneToMany } from '@mikro-orm/core';
import { RelType } from './RelType.js';
import { VersionedModel } from '../VersionedSchema.js';
import { RequirementModel } from '../requirements/RequirementSchema.js';

// Static properties
@Entity({ abstract: true, tableName: 'requirement_relation', discriminatorColumn: 'rel_type', discriminatorValue: RelType.RELATION })
export abstract class RequirementRelationModel {
    @ManyToOne({ entity: 'RequirementModel', primary: true })
    readonly left!: RequirementModel

    @ManyToOne({ entity: 'RequirementModel', primary: true })
    readonly right!: RequirementModel

    @OneToMany({ entity: 'RequirementRelationVersionsModel', mappedBy: 'requirementRelation' })
    readonly versions = new Collection<RequirementRelationVersionsModel>(this)
}

// Volatile properties
@Entity({
    abstract: true, tableName: 'requirement_relation_versions', discriminatorColumn: 'rel_type', discriminatorValue: RelType.RELATION
})
export abstract class RequirementRelationVersionsModel extends VersionedModel {
    @ManyToOne({ entity: 'RequirementRelationModel', primary: true })
    readonly requirementRelation!: RequirementRelationModel
}