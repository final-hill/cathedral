import type { z } from 'zod'
import { v7 as uuid7 } from 'uuid'
import { Repository } from './Repository'
import type { Requirement } from '#shared/domain/requirements'
import * as req from '#shared/domain/requirements'
import * as reqModels from '../models/requirements'
import type { AuditMetadata } from '~/shared/domain'
import { ConstraintCategory, MoscowPriority, NotFoundException, ReqType, StakeholderCategory, StakeholderSegmentation, WorkflowState } from '~/shared/domain'
import { snakeCaseToPascalCase, resolveReqTypeFromModel } from '~/shared/utils'
import { DataModelToDomainModel, ReqQueryToModelQuery } from '../mappers'
import type { CreationInfo } from './CreationInfo'
import type { UpdationInfo } from './UpdationInfo'
import type { llmRequirementSchema } from '../llm-zod-schemas'
import type { ObjectQuery } from '@mikro-orm/core'

type RequirementType = z.infer<typeof Requirement>

export class RequirementRepository extends Repository<RequirementType> {
    /**
     * Add a new requirement to the database
     * @param props.createdById The id of the user that created the requirement
     * @param props.creationDate The date when the requirement becomes effective
     * @param props.reqProps The properties of the requirement to add
     * @returns The id of the requirement
     */
    async add(props: CreationInfo & {
        reqProps: Omit<RequirementType, 'reqId' | 'reqIdPrefix' | 'id' | keyof z.infer<typeof AuditMetadata>>
    }): Promise<RequirementType['id']> {
        const em = this._em,
            { reqType, ...reqProps } = props.reqProps,
            ReqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
            ReqStaticModel = reqModels[`${ReqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
            ReqVersionsModel = reqModels[`${ReqTypePascal}VersionsModel` as keyof typeof reqModels] as typeof reqModels.RequirementVersionsModel,
            mappedProps = await new ReqQueryToModelQuery().map(reqProps) as Record<string, unknown>

        const newId = uuid7()

        em.create(ReqVersionsModel, {
            requirement: em.create(ReqStaticModel, {
                id: newId,
                createdById: props.createdById,
                creationDate: props.creationDate
            }),
            isDeleted: false,
            effectiveFrom: props.creationDate,
            modifiedById: props.createdById,
            ...mappedProps
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)

        await em.flush()

        return newId
    }

    async addParsedRequirements(props: CreationInfo & {
        solutionId: string
        name: string
        statement: string
        reqData: z.infer<typeof llmRequirementSchema>[]
    }): Promise<reqModels.ParsedRequirementsModel['id']> {
        const em = this._em,
            parsedReqsId = uuid7()

        em.create(reqModels.ParsedRequirementsVersionsModel, {
            requirement: em.create(reqModels.ParsedRequirementsModel, {
                id: parsedReqsId,
                createdById: props.createdById,
                creationDate: props.creationDate
            }),
            isDeleted: false,
            effectiveFrom: props.creationDate,
            modifiedById: props.createdById,
            workflowState: WorkflowState.Proposed,
            solution: props.solutionId,
            name: props.name,
            description: props.statement
        })

        for (const req of props.reqData) {
            const reqTypePascal = snakeCaseToPascalCase(req.reqType) as keyof typeof req,
                ReqStaticModel = reqModels[`${reqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
                ReqVersionsModel = reqModels[`${reqTypePascal}VersionsModel` as keyof typeof reqModels] as typeof reqModels.RequirementVersionsModel,
                newId = uuid7()

            const newPrimaryActorId = req.primaryActorName ? uuid7() : undefined
            if (newPrimaryActorId) {
                em.create(reqModels.StakeholderVersionsModel, {
                    requirement: em.create(reqModels.StakeholderModel, {
                        id: newPrimaryActorId,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name: req.primaryActorName!,
                    description: req.primaryActorName!,
                    category: StakeholderCategory['Key Stakeholder'],
                    segmentation: StakeholderSegmentation.Vendor,
                    interest: 75,
                    influence: 75
                })
            }

            const newOutcomeId = req.outcomeName ? uuid7() : undefined
            if (newOutcomeId) {
                em.create(reqModels.OutcomeVersionsModel, {
                    requirement: em.create(reqModels.OutcomeModel, {
                        id: newOutcomeId,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name: req.outcomeName!,
                    description: req.outcomeName!
                })
            }

            const newPreconditionId = req.useCasePreconditionName ? uuid7() : undefined
            if (newPreconditionId) {
                em.create(reqModels.AssumptionVersionsModel, {
                    requirement: em.create(reqModels.AssumptionModel, {
                        id: newPreconditionId,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name: req.useCasePreconditionName!,
                    description: req.useCasePreconditionName!
                })
            }

            const newSuccessGuaranteeId = req.useCaseSuccessGuaranteeName ? uuid7() : undefined
            if (newSuccessGuaranteeId) {
                em.create(reqModels.EffectVersionsModel, {
                    requirement: em.create(reqModels.EffectModel, {
                        id: newSuccessGuaranteeId,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name: req.useCaseSuccessGuaranteeName!,
                    description: req.useCaseSuccessGuaranteeName!
                })
            }

            const newFunctionalBehaviorId = req.userStoryFunctionalBehaviorName ? uuid7() : undefined
            if (newFunctionalBehaviorId) {
                em.create(reqModels.FunctionalBehaviorVersionsModel, {
                    requirement: em.create(reqModels.FunctionalBehaviorModel, {
                        id: newFunctionalBehaviorId,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    description: req.userStoryFunctionalBehaviorName!,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name: req.userStoryFunctionalBehaviorName!,
                    priority: MoscowPriority.MUST
                })
            }

            em.create(ReqVersionsModel, {
                requirement: em.create(ReqStaticModel, {
                    id: newId,
                    createdById: props.createdById,
                    creationDate: props.creationDate,
                    parsedRequirements: parsedReqsId
                }),
                isDeleted: false,
                effectiveFrom: props.creationDate,
                modifiedById: props.createdById,
                workflowState: WorkflowState.Proposed,
                solution: props.solutionId,
                description: req.description,
                name: req.name,
                ...(req.moscowPriority && { priority: req.moscowPriority }),
                ...(req.email && { email: req.email }),
                ...(newPrimaryActorId && { primaryActor: newPrimaryActorId }),
                ...(newOutcomeId && { outcome: newOutcomeId }),
                ...(req.stakeholderSegmentation && { segmentation: req.stakeholderSegmentation }),
                ...(req.stakeholderCategory && { category: req.stakeholderCategory }),
                ...(req.reqType === ReqType.CONSTRAINT && { category: req.constraintCategory || ConstraintCategory['Business Rule'] }),
                ...(req.useCaseScope && { scope: req.useCaseScope }),
                ...(req.useCaseLevel && { level: req.useCaseLevel }),
                ...(newPreconditionId && { precondition: newPreconditionId }),
                ...(req.useCaseMainSuccessScenario && { mainSuccessScenario: req.useCaseMainSuccessScenario }),
                ...(newSuccessGuaranteeId && { successGuarantee: newSuccessGuaranteeId }),
                ...(req.useCaseExtensions && { extensions: req.useCaseExtensions }),
                ...(newFunctionalBehaviorId && { functionalBehavior: newFunctionalBehaviorId })
            })
        }

        await em.flush()

        return parsedReqsId
    }

    /**
     * Get all active requirements with the given solution id.
     * @param props.solutionId The id of the solution to find requirements for
     * @param props.reqType The type of requirement to find
     */
    async getAllActive<R extends RequirementType>(props: {
        solutionId: string
        reqType: ReqType
    }): Promise<R[]> {
        const em = this._em,
            reqTypePascal = snakeCaseToPascalCase(props.reqType) as keyof typeof req,
            ReqStaticModel = reqModels[`${reqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
            mapper = new DataModelToDomainModel()

        const reqStatics = (await em.find(ReqStaticModel, {
            versions: {
                solution: { id: props.solutionId },
                workflowState: { $in: [WorkflowState.Active, WorkflowState.Removed] },
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            }
        }, {
            populate: ['parsedRequirements']
        }))

        const requirements = await Promise.all(reqStatics.map(async (reqStatic) => {
            const versions = await reqStatic.versions.matching({
                    where: {
                        solution: { id: props.solutionId },
                        workflowState: { $in: [WorkflowState.Active, WorkflowState.Removed] },
                        effectiveFrom: { $lte: new Date() },
                        isDeleted: false
                    },
                    orderBy: { effectiveFrom: 'desc' },
                    limit: 2,
                    populate: ['*']
                }),
                latestActive = versions.find(v => v.workflowState === WorkflowState.Active),
                latestRemoved = versions.find(v => v.workflowState === WorkflowState.Removed)

            // Compare effectiveFrom dates to determine validity
            if (latestRemoved && (!latestActive || latestRemoved.effectiveFrom > latestActive.effectiveFrom))
                return undefined // A newer Removed version exists, so no Active version is valid

            return req[reqTypePascal].parse(
                await mapper.map({ ...reqStatic, ...latestActive })
            ) as R
        })).then(reqs => reqs.filter(req => req !== undefined))

        return requirements
    }

    /**
     * Get the latest version of requirements with the given solution id.
     *
     * @param props.solutionId The id of the solution to find requirements for
     * @param props.reqType The type of requirement to find
     * @param props.workflowState The workflow state of the requirement to find
     * @returns The requirements
     */
    async getAllLatest<R extends RequirementType>(props: {
        solutionId: string
        reqType: ReqType
        workflowState: WorkflowState
    }): Promise<R[]> {
        const em = this._em,
            reqTypePascal = snakeCaseToPascalCase(props.reqType) as keyof typeof req,
            ReqStaticModel = reqModels[`${reqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
            mapper = new DataModelToDomainModel()

        const reqStatics = (await em.find(ReqStaticModel, {
            versions: {
                solution: { id: props.solutionId },
                workflowState: props.workflowState,
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            }
        }, {
            populate: ['parsedRequirements']
        }))

        const requirements = await Promise.all(reqStatics.map(async (reqStatic) => {
            const versions = await reqStatic.versions.matching({
                    where: {
                        solution: { id: props.solutionId },
                        workflowState: props.workflowState,
                        effectiveFrom: { $lte: new Date() },
                        isDeleted: false
                    },
                    orderBy: { effectiveFrom: 'desc' },
                    limit: 1,
                    populate: ['*']
                }),
                latestVersion = versions[0]

            if (!latestVersion)
                return undefined

            return req[reqTypePascal].parse(
                await mapper.map({ ...reqStatic, ...latestVersion })
            ) as R
        })).then(reqs => reqs.filter(req => req !== undefined))

        return requirements
    }

    /**
     * Get all requirements with the given solution id across all workflow states.
     * @param props.solutionId The id of the solution to find requirements for
     * @param props.reqType The type of requirement to find
     * @param props.staticQuery The optional static query to use to find requirements
     * @returns The requirements across all workflow states
     */
    async getAll<R extends RequirementType>(props: {
        solutionId: string
        reqType: ReqType
        staticQuery?: ObjectQuery<reqModels.RequirementModel>
    }): Promise<R[]> {
        const em = this._em,
            reqTypePascal = snakeCaseToPascalCase(props.reqType) as keyof typeof req,
            ReqStaticModel = reqModels[`${reqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
            mapper = new DataModelToDomainModel()

        const reqStatics = (await em.find(ReqStaticModel, {
            ...(props.staticQuery ?? {}),
            versions: {
                solution: { id: props.solutionId },
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            }
        }, {
            populate: ['parsedRequirements']
        }))

        const requirements = await Promise.all(reqStatics.map(async (reqStatic) => {
            const versions = await reqStatic.versions.matching({
                    where: {
                        solution: { id: props.solutionId },
                        effectiveFrom: { $lte: new Date() },
                        isDeleted: false
                    },
                    orderBy: { effectiveFrom: 'desc' },
                    populate: ['*']
                }),
                latestVersion = versions[0]

            if (!latestVersion)
                return undefined

            return req[reqTypePascal].parse(
                await mapper.map({ ...reqStatic, ...latestVersion })
            ) as R
        })).then(reqs => reqs.filter(req => req !== undefined))

        return requirements
    }

    /**
     * Get a requirement by its id
     * @param id The id of the requirement to get
     * @returns The requirement with the given id
     * @throws {NotFoundException} If the requirement does not exist
     */
    async getById<R extends RequirementType>(id: z.infer<typeof Requirement>['id']): Promise<R> {
        const em = this._em,
            reqStatic = await em.findOne(reqModels.RequirementModel, { id }),
            reqLatestVersion = await reqStatic?.getLatestVersion(new Date())

        if (!reqStatic || !reqLatestVersion)
            throw new NotFoundException(`Requirement with id ${id} not found`)

        // Use utility function to resolve req_type from the model instance
        const req_type = resolveReqTypeFromModel(reqStatic)

        const reqTypePascal = snakeCaseToPascalCase(req_type) as keyof typeof req,
            mapper = new DataModelToDomainModel()

        return req[reqTypePascal].parse(
            await mapper.map({ ...reqStatic, ...reqLatestVersion })
        ) as R
    }

    /**
     * Update a requirement in the database
     * @param props.modifiedById The id of the user that modified the requirement
     * @param props.modifiedDate The date when the requirement becomes effective
     * @param props The properties of the requirement to update
     * @throws {NotFoundException} If the requirement does not exist
     */
    async update(props: UpdationInfo & {
        reqProps: Omit<Partial<RequirementType>, 'reqIdPrefix' | keyof z.infer<typeof AuditMetadata>>
            & { id: z.infer<typeof Requirement>['id'], reqType: ReqType }
    }): Promise<void> {
        const em = this._em,
            { reqType, ...reqProps } = props.reqProps,
            ReqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
            ReqStaticModel = reqModels[`${ReqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
            ReqVersionsModel = reqModels[`${ReqTypePascal}VersionsModel` as keyof typeof reqModels] as typeof reqModels.RequirementVersionsModel,
            mappedProps = await new ReqQueryToModelQuery().map(reqProps) as Record<string, unknown>

        const existingReqStatic = await em.findOne(ReqStaticModel, { id: props.reqProps.id }),
            existingReqVersion = await existingReqStatic?.getLatestVersion(props.modifiedDate)

        if (!existingReqStatic || !existingReqVersion)
            throw new NotFoundException(`Requirement with id ${props.reqProps.id} not found`)

        em.create(ReqVersionsModel, {
            ...existingReqVersion,
            ...mappedProps,
            requirement: existingReqStatic,
            isDeleted: false,
            effectiveFrom: props.modifiedDate,
            modifiedById: props.modifiedById
        })

        await em.flush()
    }

    /**
     * Check if there are newer versions of a requirement in Proposed or Review states.
     * This prevents parallel conflicting changes by ensuring only one revision process
     * can be active at a time for any given Active requirement.
     *
     * @param requirementId - The id of the requirement to check
     * @returns true if there are newer versions in Proposed or Review states
     */
    async hasNewerProposedOrReviewVersions(requirementId: RequirementType['id']): Promise<boolean> {
        const em = this._em,
            requirement = await em.findOne(reqModels.RequirementModel, { id: requirementId })

        if (!requirement) {
            return false
        }

        // Get the latest active version
        const latestActiveVersion = await requirement.getLatestActiveVersion()

        if (!latestActiveVersion) {
            return false
        }

        // Check if there are any versions in Proposed or Review states that are newer than the active version
        // This indicates parallel development is already in progress
        const newerVersions = await requirement.versions.matching({
            where: {
                effectiveFrom: { $gt: latestActiveVersion.effectiveFrom },
                workflowState: { $in: [WorkflowState.Proposed, WorkflowState.Review] },
                isDeleted: false
            }
        })

        return newerVersions.length > 0
    }
}
