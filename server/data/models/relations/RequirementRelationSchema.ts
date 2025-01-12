import { Collection, Entity, Enum, ManyToOne, OneToMany, OptionalProps, Property } from '@mikro-orm/core';
import { RelType } from './RelType.js';
import { StaticAuditModel, VolatileAuditModel } from '../AuditSchema.js';
import { RequirementModel } from '../requirements/RequirementSchema.js';
import { AppUserModel } from '../application/AppUserSchema.js';

// Static properties
@Entity({ abstract: true, tableName: 'requirement_relation', discriminatorColumn: 'rel_type', discriminatorValue: RelType.RELATION })
export abstract class RequirementRelationModel extends StaticAuditModel {
    [OptionalProps]?: 'rel_type'

    @Enum({ items: () => RelType, primary: true })
    readonly rel_type!: RelType

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
export abstract class RequirementRelationVersionsModel extends VolatileAuditModel {
    [OptionalProps]?: 'rel_type'

    @Enum({ items: () => RelType, primary: true })
    readonly rel_type!: RelType

    @ManyToOne({ entity: 'RequirementRelationModel', primary: true })
    readonly requirementRelation!: RequirementRelationModel
}