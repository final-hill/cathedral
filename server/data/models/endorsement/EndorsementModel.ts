import { Entity, Enum, ManyToOne, Property, PrimaryKey, types, Unique } from '@mikro-orm/core'
import { EndorsementStatus, EndorsementCategory } from '../../../../shared/domain/endorsement/index.js'
import type { AutomatedCheckDetailsType } from '../../../../shared/domain/endorsement/index.js'
import { RequirementVersionsModel, ActorModel } from '../requirements/index.js'

@Entity({ tableName: 'endorsement' })
export class EndorsementModel {
    @PrimaryKey({ type: types.uuid })
    id!: string

    @ManyToOne(() => RequirementVersionsModel)
    requirementVersion!: RequirementVersionsModel

    @ManyToOne(() => ActorModel, { nullable: true })
    endorsedBy?: ActorModel

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

    /**
     * JSONB field containing automated check details
     * Structure follows AutomatedCheckDetails schema (base) extended by category-specific schemas
     * - For READABILITY: ReadabilityCheckDetails with checkType: ReadabilityCheckType
     * - For other categories: category-specific details schemas
     * Contains: checkType, errorMessage, retryCount, and category-specific fields
     *
     * For automated checks (endorsedBy is null), checkType within this JSON field
     * serves as part of the logical unique key along with requirementVersion and category
     */
    @Property({ type: types.json, nullable: true })
    checkDetails?: AutomatedCheckDetailsType
}
