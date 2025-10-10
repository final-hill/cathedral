import { Entity, Enum, ManyToOne, Property, PrimaryKey, types, Unique } from '@mikro-orm/core'
import { EndorsementStatus, EndorsementCategory } from '../../../../shared/domain/endorsement/index.js'
import { RequirementVersionsModel, ActorModel } from '../requirements/index.js'

@Entity({ tableName: 'endorsement' })
@Unique({ properties: ['requirementVersion', 'endorsedBy', 'category'] })
export class EndorsementModel {
    @PrimaryKey({ type: types.uuid })
    id!: string

    @ManyToOne(() => RequirementVersionsModel)
    requirementVersion!: RequirementVersionsModel

    @ManyToOne(() => ActorModel)
    endorsedBy!: ActorModel

    @Enum({ items: () => EndorsementCategory })
    category!: EndorsementCategory

    @Enum({ items: () => EndorsementStatus })
    status!: EndorsementStatus

    @Property({ type: types.datetime, nullable: true })
    endorsedAt?: Date

    @Property({ type: types.datetime, nullable: true })
    rejectedAt?: Date

    @Property({ type: types.text, nullable: true })
    comments?: string
}
