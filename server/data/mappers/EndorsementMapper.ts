import type { EndorsementType } from '#shared/domain/endorsement/Endorsement'
import { Endorsement } from '#shared/domain/endorsement/Endorsement'
import type { EndorsementModel } from '../models/endorsement'
import type { Mapper } from '#shared/types/Mapper'
import { createDomainReferenceFromModel, createDomainVersionReferenceFromModel } from './DataModelToDomainModel'

/**
 * Maps EndorsementModel to EndorsementType using the shared reference mapping utilities
 */
export class EndorsementMapper implements Mapper<EndorsementModel, EndorsementType> {
    async map(endorsementModel: EndorsementModel): Promise<EndorsementType> {
        const [requirementVersionRef, endorsedByRef] = await Promise.all([
            createDomainVersionReferenceFromModel(endorsementModel.requirementVersion),
            createDomainReferenceFromModel(endorsementModel.endorsedBy)
        ])

        return Endorsement.parse({
            id: endorsementModel.id,
            requirementVersion: requirementVersionRef,
            endorsedBy: endorsedByRef,
            category: endorsementModel.category,
            status: endorsementModel.status,
            endorsedAt: endorsementModel.endorsedAt || undefined,
            rejectedAt: endorsementModel.rejectedAt || undefined,
            comments: endorsementModel.comments
        })
    }
}
