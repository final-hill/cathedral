import { Entity, ManyToOne } from '@mikro-orm/core';
import { RelType } from './RelType.js';
import { VersionedModel } from '../VersionedSchema.js';
import { RequirementModel } from '../requirements/index.js';

// Static properties
@Entity({ abstract: true, tableName: 'requirement_relation', discriminatorColumn: 'rel_type', discriminatorValue: RelType.RELATION })
export abstract class RequirementRelationModel {
    @ManyToOne({ entity: () => RequirementModel, primary: true })
    readonly left!: RequirementModel

    @ManyToOne({ entity: () => RequirementModel, primary: true })
    readonly right!: RequirementModel
}

// Volatile properties
@Entity({
    abstract: true, tableName: 'requirement_relation_versions', discriminatorColumn: 'rel_type', discriminatorValue: RelType.RELATION
})
export abstract class RequirementRelationVersionsModel extends VersionedModel {
    @ManyToOne({ entity: () => RequirementRelationModel, primary: true })
    readonly requirementRelation!: RequirementRelationModel
}