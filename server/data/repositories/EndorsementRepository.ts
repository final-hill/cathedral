import { Repository } from './Repository.js'
import type { EndorsementType, EndorsementCategory } from '#shared/domain/endorsement/index.js'
import { EndorsementStatus } from '#shared/domain/endorsement/index.js'
import type { UpdationInfo } from './UpdationInfo.js'
import type { ReqType } from '#shared/domain/index.js'
import { NotFoundException, WorkflowState } from '#shared/domain/index.js'
import { EndorsementModel } from '../models/endorsement/index.js'
import { ActorModel } from '../models/requirements/index.js'
import type * as req from '#shared/domain/requirements'
import * as reqModels from '../models/requirements'
import { v7 as uuid7 } from 'uuid'
import { EndorsementMapper } from '../mappers/index.js'
import { snakeCaseToPascalCase } from '#shared/utils/index.js'

export class EndorsementRepository extends Repository<EndorsementType> {
    private readonly mapper = new EndorsementMapper()

    /**
     * Create a new endorsement for a requirement's Review version
     * @param props - The endorsement creation parameters
     * @param props.requirementId - The ID of the requirement being endorsed
     * @param props.reqType - The type of the requirement
     * @param props.endorsedBy - The ID of the actor providing the endorsement
     * @param props.category - The category of endorsement (role-based or quality dimension)
     * @param props.status - The status of the endorsement
     * @param props.comments - Optional comments from the endorser
     * @returns The created endorsement ID
     * @throws {NotFoundException} if the requirement Review version or actor is not found
     */
    async create(props: {
        requirementId: string
        reqType: ReqType
        endorsedBy: string
        category: EndorsementCategory
        status: EndorsementStatus
        comments?: string
    }): Promise<string> {
        const em = this._em,
            ReqTypePascal = snakeCaseToPascalCase(props.reqType) as keyof typeof req,
            ReqVersionsModel = reqModels[`${ReqTypePascal}VersionsModel` as keyof typeof reqModels] as typeof reqModels.RequirementVersionsModel,
            reviewVersion = await em.findOne(ReqVersionsModel, {
                requirement: props.requirementId,
                workflowState: WorkflowState.Review
            })

        if (!reviewVersion)
            throw new NotFoundException(`No Review version found for requirement ${props.requirementId}`)

        const endorsedBy = em.getReference(ActorModel, props.endorsedBy),
            endorsementModel = em.create(EndorsementModel, {
                id: uuid7(),
                requirementVersion: reviewVersion,
                endorsedBy,
                category: props.category,
                status: props.status,
                comments: props.comments
            })

        await em.flush()
        return endorsementModel.id
    }

    /**
     * Update an endorsement's status
     * @param props - The endorsement update parameters
     * @param props.requirementId - The ID of the requirement being endorsed
     * @param props.reqType - The requirement type to determine the correct version model
     * @param props.actorId - The ID of the actor whose endorsement is being updated
     * @param props.category - The category of endorsement being updated
     * @param props.status - The new status of the endorsement (ENDORSED or REJECTED)
     * @param props.endorsedByActorId - The ID of the actor performing the endorsement action
     * @param props.comments - Optional comments from the endorser
     * @param props.modifiedById - The ID of the user making the modification
     * @param props.modifiedDate - The date of the modification
     * @throws {NotFoundException} if the endorsement or actor is not found
     */
    async updateEndorsement(props: UpdationInfo & {
        requirementId: string
        reqType: ReqType
        actorId: string
        category: EndorsementCategory
        status: EndorsementStatus.APPROVED | EndorsementStatus.REJECTED
        endorsedByActorId: string
        comments?: string
    }): Promise<void> {
        const em = this._em,
            // Find the endorsement directly using the requirement version in Review state
            endorsementModel = await em.findOne(EndorsementModel, {
                requirementVersion: {
                    requirement: props.requirementId,
                    workflowState: WorkflowState.Review
                },
                endorsedBy: { id: props.actorId },
                category: props.category
            })

        if (!endorsementModel)
            throw new NotFoundException(`Endorsement for requirement ${props.requirementId} Review version, actor ${props.actorId}, and category ${props.category} not found`)

        const endorsedByActor = await em.findOne(ActorModel, props.endorsedByActorId)

        if (!endorsedByActor)
            throw new NotFoundException(`Actor with id ${props.endorsedByActorId} not found`)

        endorsementModel.status = props.status
        endorsementModel.comments = props.comments || endorsementModel.comments
        endorsementModel.endorsedAt = props.status === EndorsementStatus.APPROVED ? props.modifiedDate : undefined
        endorsementModel.rejectedAt = props.status === EndorsementStatus.REJECTED ? props.modifiedDate : undefined

        await em.flush()
    }

    /**
     * Find all endorsements for a requirement currently in Review state
     * @param requirementId - The requirement ID
     * @returns Array of endorsements for the requirement's Review version
     */
    async findByRequirementInReview(requirementId: string): Promise<EndorsementType[]> {
        const em = this._em,

            // First, find the Review version of the requirement
            reviewVersion = await em.findOne(reqModels.RequirementVersionsModel, {
                requirement: requirementId,
                workflowState: WorkflowState.Review,
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            })

        if (!reviewVersion)
            return []

        // Use a simple query directly on the composite foreign key columns
        // To avoid discriminator issues, fetch the endorsement data and manually populate endorsedBy later
        const qb = em.createQueryBuilder(EndorsementModel, 'e')
        qb.leftJoinAndSelect('e.requirementVersion', 'rv')
            .leftJoinAndSelect('rv.requirement', 'req')
            .where('e.requirement_version_effective_from = ?', [reviewVersion.effectiveFrom])
            .andWhere('e.requirement_version_requirement_id = ?', [reviewVersion.requirement.id])

        const endorsements = await qb.getResult()

        // Manually populate the endorsedBy for each endorsement
        for (const endorsement of endorsements) {
            const endorsedByRequirement = await em.findOne(reqModels.RequirementModel, endorsement.endorsedBy.id)
            if (endorsedByRequirement)
                endorsement.endorsedBy = endorsedByRequirement
        }

        return Promise.all(endorsements.map(e => this.mapper.map(e)))
    }

    /**
     * Find a specific endorsement by requirement in Review state, actor, and category
     * @param params - The search parameters
     * @param params.requirementId - The requirement ID
     * @param params.actorId - The actor ID
     * @param params.category - The endorsement category
     * @returns The endorsement or null if not found
     */
    async findByRequirementInReviewActorAndCategory({ requirementId, actorId, category }: {
        requirementId: string
        actorId: string
        category: EndorsementCategory
    }): Promise<EndorsementType | null> {
        const em = this._em,
            reviewVersion = await em.findOne(reqModels.RequirementVersionsModel, {
                requirement: requirementId,
                workflowState: WorkflowState.Review,
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            })

        if (!reviewVersion)
            return null

        const qb = em.createQueryBuilder(EndorsementModel, 'e')
        qb.leftJoinAndSelect('e.requirementVersion', 'rv')
            .leftJoinAndSelect('rv.requirement', 'req')
            .where('e.requirement_version_effective_from = ?', [reviewVersion.effectiveFrom])
            .andWhere('e.requirement_version_requirement_id = ?', [reviewVersion.requirement.id])
            .andWhere('e.endorsed_by_id = ?', [actorId])
            .andWhere('e.category = ?', [category])

        const endorsementModel = await qb.getSingleResult()

        if (!endorsementModel)
            return null

        const endorsedByRequirement = await em.findOne(reqModels.RequirementModel, endorsementModel.endorsedBy.id)
        if (endorsedByRequirement)
            endorsementModel.endorsedBy = endorsedByRequirement

        return this.mapper.map(endorsementModel)
    }

    /**
     * Get endorsement by ID
     * @param id - The endorsement ID
     * @returns The endorsement
     * @throws {NotFoundException} if not found
     */
    async getById(id: string): Promise<EndorsementType> {
        const em = this._em,
            endorsement = await em.findOne(EndorsementModel, {
                id
            }, {
                populate: ['requirementVersion', 'endorsedBy']
            })

        if (!endorsement)
            throw new NotFoundException(`Endorsement with id ${id} not found`)

        return this.mapper.map(endorsement)
    }

    /**
     * Get all pending endorsements for a solution
     * @param solutionId - The solution ID to filter by
     * @returns Array of pending endorsements
     */
    async getPendingEndorsements(solutionId: string): Promise<EndorsementType[]> {
        const em = this._em,
            endorsements = await em.find(EndorsementModel, {
                status: EndorsementStatus.PENDING,
                requirementVersion: {
                    solution: solutionId
                }
            }, {
                populate: ['requirementVersion', 'endorsedBy']
            })

        return Promise.all(endorsements.map(e => this.mapper.map(e)))
    }
}
