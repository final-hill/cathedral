import type { z } from 'zod'
import { v7 as uuid7 } from 'uuid'
import { Repository } from './Repository'
import * as req from '#shared/domain/requirements'
import * as reqModels from '../models/requirements'
import type { AuditMetadataType, RequirementType } from '~/shared/domain'
import { ConstraintCategory, MoscowPriority, NotFoundException, ReqType, ScenarioStepTypeEnum, StakeholderCategory, StakeholderSegmentation, WorkflowState } from '~/shared/domain'
import { snakeCaseToPascalCase, resolveReqTypeFromModel } from '~/shared/utils'
import { DataModelToDomainModel, ReqQueryToModelQuery } from '../mappers'
import type { CreationInfo } from './CreationInfo'
import type { UpdationInfo } from './UpdationInfo'
import type { llmRequirementSchema } from '../llm-zod-schemas'
import type { ObjectQuery } from '@mikro-orm/core'

export class RequirementRepository extends Repository<RequirementType> {
    /**
     * Add a new requirement to the database
     * @param props.createdById The id of the user that created the requirement
     * @param props.creationDate The date when the requirement becomes effective
     * @param props.reqProps The properties of the requirement to add
     * @returns The id of the requirement
     */
    async add(props: CreationInfo & {
        reqProps: Omit<req.RequirementType, 'reqId' | 'reqIdPrefix' | 'id' | keyof AuditMetadataType>
    }): Promise<req.RequirementType['id']> {
        const em = this._em,
            { reqType, ...reqProps } = props.reqProps,
            ReqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
            ReqStaticModel = reqModels[`${ReqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
            ReqVersionsModel = reqModels[`${ReqTypePascal}VersionsModel` as keyof typeof reqModels] as typeof reqModels.RequirementVersionsModel,
            mappedProps = await new ReqQueryToModelQuery().map(reqProps) as Record<string, unknown>,
            newId = uuid7()

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
            parsedReqsId = uuid7(),
            // Create lookup maps for reusable entities to avoid duplicates
            // Map<name, id>
            actorMap = new Map<string, string>(),
            functionalBehaviorMap = new Map<string, string>(),
            outcomeMap = new Map<string, string>(),
            systemComponentMap = new Map<string, string>(),
            assumptionMap = new Map<string, string>(),
            effectMap = new Map<string, string>(),
            stakeholderMap = new Map<string, string>(),
            // Map for scenario step conditions: "stepId:conditionName" -> assumptionId
            stepConditionMap = new Map<string, string>(),
            getOrCreateActor = (name: string): string => {
                if (actorMap.has(name)) return actorMap.get(name)!

                const id = uuid7()
                em.create(reqModels.StakeholderVersionsModel, {
                    requirement: em.create(reqModels.StakeholderModel, {
                        id,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    description: name,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name,
                    category: StakeholderCategory['Key Stakeholder'],
                    segmentation: StakeholderSegmentation.Client,
                    interest: 75,
                    influence: 75
                })
                actorMap.set(name, id)
                return id
            },
            getOrCreateFunctionalBehavior = (name: string): string => {
                if (functionalBehaviorMap.has(name)) return functionalBehaviorMap.get(name)!
                const id = uuid7()
                em.create(reqModels.FunctionalBehaviorVersionsModel, {
                    requirement: em.create(reqModels.FunctionalBehaviorModel, {
                        id,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    description: name,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name,
                    priority: MoscowPriority.MUST
                })
                functionalBehaviorMap.set(name, id)
                return id
            },
            getOrCreateOutcome = (name: string): string => {
                if (outcomeMap.has(name)) return outcomeMap.get(name)!

                const id = uuid7()
                em.create(reqModels.OutcomeVersionsModel, {
                    requirement: em.create(reqModels.OutcomeModel, {
                        id,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name,
                    description: name
                })
                outcomeMap.set(name, id)
                return id
            },
            getOrCreateSystemComponent = (name: string): string => {
                if (systemComponentMap.has(name))
                    return systemComponentMap.get(name)!

                const id = uuid7()
                em.create(reqModels.SystemComponentVersionsModel, {
                    requirement: em.create(reqModels.SystemComponentModel, {
                        id,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name,
                    description: name
                })
                systemComponentMap.set(name, id)
                return id
            },
            getOrCreateAssumption = (name: string): string => {
                if (assumptionMap.has(name))
                    return assumptionMap.get(name)!

                const id = uuid7()
                em.create(reqModels.AssumptionVersionsModel, {
                    requirement: em.create(reqModels.AssumptionModel, {
                        id,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name,
                    description: name
                })
                assumptionMap.set(name, id)
                return id
            },
            getOrCreateEffect = (name: string): string => {
                if (effectMap.has(name))
                    return effectMap.get(name)!

                const id = uuid7()
                em.create(reqModels.EffectVersionsModel, {
                    requirement: em.create(reqModels.EffectModel, {
                        id,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name,
                    description: name
                })
                effectMap.set(name, id)
                return id
            },
            getOrCreateStakeholder = (name: string): string => {
                if (stakeholderMap.has(name))
                    return stakeholderMap.get(name)!

                const id = uuid7()
                em.create(reqModels.StakeholderVersionsModel, {
                    requirement: em.create(reqModels.StakeholderModel, {
                        id,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name,
                    description: name,
                    segmentation: StakeholderSegmentation.Client,
                    category: StakeholderCategory['Key Stakeholder'],
                    interest: 75,
                    influence: 75
                })
                stakeholderMap.set(name, id)
                return id
            },
            createConditionAssumption = (name: string, scenarioStep: reqModels.ScenarioStepVersionsModel): string => {
                const stepConditionKey = `${scenarioStep.requirement.id}:${name}`

                // Check if we already created this condition for this scenario step
                if (stepConditionMap.has(stepConditionKey))
                    return stepConditionMap.get(stepConditionKey)!

                const id = uuid7()
                em.create(reqModels.AssumptionVersionsModel, {
                    requirement: em.create(reqModels.AssumptionModel, {
                        id,
                        createdById: props.createdById,
                        creationDate: props.creationDate,
                        parsedRequirements: parsedReqsId,
                        scenarioStep: scenarioStep.requirement
                    }),
                    isDeleted: false,
                    effectiveFrom: props.creationDate,
                    modifiedById: props.createdById,
                    workflowState: WorkflowState.Proposed,
                    solution: props.solutionId,
                    name,
                    description: name
                })

                stepConditionMap.set(stepConditionKey, id)
                return id
            }

        em.create(reqModels.ParsedRequirementsVersionsModel, {
            requirement: em.create(reqModels.ParsedRequirementsModel, {
                id: parsedReqsId,
                createdById: props.createdById,
                creationDate: props.creationDate
            }),
            isDeleted: false,
            effectiveFrom: props.creationDate,
            modifiedById: props.createdById,
            workflowState: WorkflowState.Parsed,
            solution: props.solutionId,
            name: props.name,
            description: props.statement
        })

        for (const req of props.reqData) {
            const reqTypePascal = snakeCaseToPascalCase(req.reqType) as keyof typeof req,
                ReqStaticModel = reqModels[`${reqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
                ReqVersionsModel = reqModels[`${reqTypePascal}VersionsModel` as keyof typeof reqModels] as typeof reqModels.RequirementVersionsModel,
                newId = uuid7(),
                newPrimaryActorId = req.primaryActorName ? getOrCreateActor(req.primaryActorName) : undefined,
                newOutcomeId = req.outcomeName ? getOrCreateOutcome(req.outcomeName) : undefined,
                newPreconditionIds: string[] = [],
                newSuccessGuaranteeIds: string[] = [],
                newStakeholderIds: string[] = [],
                newScopeSystemComponentId = req.useCaseScopeName ? getOrCreateSystemComponent(req.useCaseScopeName) : undefined,
                newFunctionalBehaviorId = req.scenarioFunctionalBehaviorName ? getOrCreateFunctionalBehavior(req.scenarioFunctionalBehaviorName) : undefined
            if (req.useCasePreconditionNames && req.useCasePreconditionNames.length > 0) {
                for (const preconditionName of req.useCasePreconditionNames)
                    newPreconditionIds.push(getOrCreateAssumption(preconditionName))
            }

            if (req.useCaseSuccessGuaranteeNames && req.useCaseSuccessGuaranteeNames.length > 0) {
                for (const successGuaranteeName of req.useCaseSuccessGuaranteeNames)
                    newSuccessGuaranteeIds.push(getOrCreateEffect(successGuaranteeName))
            }

            if (req.useCaseStakeholderNames && req.useCaseStakeholderNames.length > 0) {
                for (const stakeholderName of req.useCaseStakeholderNames)
                    newStakeholderIds.push(getOrCreateStakeholder(stakeholderName))
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
                ...(req.priority && { priority: req.priority }),
                ...(req.email && { email: req.email }),
                ...(newPrimaryActorId && { primaryActor: newPrimaryActorId }),
                ...(newOutcomeId && { outcome: newOutcomeId }),
                ...(req.stakeholderSegmentation && { segmentation: req.stakeholderSegmentation }),
                ...(req.stakeholderCategory && { category: req.stakeholderCategory }),
                ...(req.reqType === ReqType.CONSTRAINT && { category: req.constraintCategory || ConstraintCategory['Business Rule'] }),
                ...(newScopeSystemComponentId && { scope: newScopeSystemComponentId }),
                ...(newFunctionalBehaviorId && { functionalBehavior: newFunctionalBehaviorId }),
                ...(req.reqType === ReqType.USE_CASE && newPreconditionIds.length > 0 && { preconditions: newPreconditionIds }),
                ...(req.reqType === ReqType.USE_CASE && newSuccessGuaranteeIds.length > 0 && { successGuarantees: newSuccessGuaranteeIds }),
                ...(req.reqType === ReqType.USE_CASE && newStakeholderIds.length > 0 && { stakeholders: newStakeholderIds })
            })

            // Create ScenarioStep entities for UseCase main success scenario steps
            const useCaseReq = req as z.infer<typeof llmRequirementSchema>
            if (req.reqType === ReqType.USE_CASE && useCaseReq.useCaseMainSuccessScenarioSteps) {
                for (const step of useCaseReq.useCaseMainSuccessScenarioSteps) {
                    const stepId = uuid7(),
                        stepActorId = step.actorName ? getOrCreateActor(step.actorName) : undefined,
                        stepFunctionalBehaviorId = step.functionalBehaviorName ? getOrCreateFunctionalBehavior(step.functionalBehaviorName) : undefined

                    // Create the scenario step
                    em.create(reqModels.ScenarioStepVersionsModel, {
                        requirement: em.create(reqModels.ScenarioStepModel, {
                            id: stepId,
                            createdById: props.createdById,
                            creationDate: props.creationDate,
                            parsedRequirements: parsedReqsId,
                            parentScenario: newId
                        }),
                        isDeleted: false,
                        effectiveFrom: props.creationDate,
                        modifiedById: props.createdById,
                        description: step.description,
                        workflowState: WorkflowState.Proposed,
                        solution: props.solutionId,
                        name: step.name,
                        stepNumber: step.stepNumber,
                        stepType: ScenarioStepTypeEnum.Action,
                        primaryActor: stepActorId || newPrimaryActorId!,
                        outcome: newOutcomeId!,
                        functionalBehavior: stepFunctionalBehaviorId || newFunctionalBehaviorId!
                    })
                }
            }

            // Create ScenarioStep entities for UseCase extension steps
            if (req.reqType === ReqType.USE_CASE && useCaseReq.useCaseExtensionSteps) {
                for (const step of useCaseReq.useCaseExtensionSteps) {
                    const stepId = uuid7(),
                        stepActorId = step.actorName ? getOrCreateActor(step.actorName) : undefined,
                        stepFunctionalBehaviorId = step.functionalBehaviorName ? getOrCreateFunctionalBehavior(step.functionalBehaviorName) : undefined,
                        scenarioStepVersionsModel = em.create(reqModels.ScenarioStepVersionsModel, {
                            requirement: em.create(reqModels.ScenarioStepModel, {
                                id: stepId,
                                createdById: props.createdById,
                                creationDate: props.creationDate,
                                parsedRequirements: parsedReqsId,
                                parentScenario: newId
                            }),
                            isDeleted: false,
                            effectiveFrom: props.creationDate,
                            modifiedById: props.createdById,
                            description: step.description,
                            workflowState: WorkflowState.Proposed,
                            solution: props.solutionId,
                            name: step.name,
                            stepNumber: step.stepNumber,
                            stepType: step.stepType,
                            primaryActor: stepActorId || newPrimaryActorId!,
                            outcome: newOutcomeId!,
                            functionalBehavior: stepFunctionalBehaviorId || newFunctionalBehaviorId!
                        })

                    // Create preconditions for CONDITION steps
                    if (step.stepType === ScenarioStepTypeEnum.Condition && step.conditionNames) {
                        for (const conditionName of step.conditionNames)
                            createConditionAssumption(conditionName, scenarioStepVersionsModel)
                    }
                }
            }
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
            mapper = new DataModelToDomainModel(),
            reqStatics = (await em.find(ReqStaticModel, {
                versions: {
                    solution: { id: props.solutionId },
                    workflowState: { $in: [WorkflowState.Active, WorkflowState.Removed] },
                    effectiveFrom: { $lte: new Date() },
                    isDeleted: false
                }
            }, {
                populate: ['parsedRequirements']
            })),
            requirements = await Promise.all(reqStatics.map(async (reqStatic) => {
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
                if (latestRemoved && (!latestActive || latestRemoved.effectiveFrom > latestActive.effectiveFrom)) return undefined // A newer Removed version exists, so no Active version is valid

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
            mapper = new DataModelToDomainModel(),
            reqStatics = (await em.find(ReqStaticModel, {
                versions: {
                    solution: { id: props.solutionId },
                    workflowState: props.workflowState,
                    effectiveFrom: { $lte: new Date() },
                    isDeleted: false
                }
            }, {
                populate: ['parsedRequirements']
            })),
            requirements = await Promise.all(reqStatics.map(async (reqStatic) => {
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

                if (!latestVersion) return undefined

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
            mapper = new DataModelToDomainModel(),
            reqStatics = (await em.find(ReqStaticModel, {
                ...(props.staticQuery ?? {}),
                versions: {
                    solution: { id: props.solutionId },
                    effectiveFrom: { $lte: new Date() },
                    isDeleted: false
                }
            }, {
                populate: ['parsedRequirements']
            })),
            requirements = await Promise.all(reqStatics.map(async (reqStatic) => {
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

                if (!latestVersion) return undefined

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
    async getById<R extends RequirementType>(id: RequirementType['id']): Promise<R> {
        const em = this._em,
            reqStatic = await em.findOne(reqModels.RequirementModel, { id }, {
                populate: ['versions', 'parsedRequirements.versions']
            }),
            reqLatestVersion = await reqStatic?.getLatestVersion(new Date())

        if (!reqStatic || !reqLatestVersion) throw new NotFoundException(`Requirement with id ${id} not found`)

        // Use utility function to resolve req_type from the model instance
        const req_type = resolveReqTypeFromModel(reqStatic),
            reqTypePascal = snakeCaseToPascalCase(req_type) as keyof typeof req,
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
        reqProps: Omit<Partial<RequirementType>, 'reqIdPrefix' | keyof AuditMetadataType>
            & { id: RequirementType['id'], reqType: ReqType }
    }): Promise<void> {
        const em = this._em,
            { reqType, ...reqProps } = props.reqProps,
            ReqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
            ReqStaticModel = reqModels[`${ReqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
            ReqVersionsModel = reqModels[`${ReqTypePascal}VersionsModel` as keyof typeof reqModels] as typeof reqModels.RequirementVersionsModel,
            mappedProps = await new ReqQueryToModelQuery().map(reqProps) as Record<string, unknown>,
            existingReqStatic = await em.findOne(ReqStaticModel, { id: props.reqProps.id }),
            existingReqVersion = await existingReqStatic?.getLatestVersion(props.modifiedDate)

        if (!existingReqStatic || !existingReqVersion) throw new NotFoundException(`Requirement with id ${props.reqProps.id} not found`)

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

        if (!requirement)
            return false

        // Get the latest active version
        const latestActiveVersion = await requirement.getLatestActiveVersion()

        if (!latestActiveVersion)
            return false

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
