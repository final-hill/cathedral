import { z } from "zod";
import { v7 as uuid7 } from 'uuid'
import { Repository } from "./Repository";
import { Requirement } from "#shared/domain/requirements";
import * as req from "#shared/domain/requirements";
import * as reqModels from "../models/requirements";
import { AuditMetadata, NotFoundException, ReqType, WorkflowState } from "~/shared/domain";
import { snakeCaseToPascalCase } from "~/shared/utils";
import { DataModelToDomainModel, ReqQueryToModelQuery } from "../mappers";
import { type CreationInfo } from "./CreationInfo";
import { type UpdationInfo } from "./UpdationInfo";

type RequirementType = z.infer<typeof Requirement>;

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
            mappedProps = await new ReqQueryToModelQuery().map(reqProps) as any

        const newId = uuid7()

        em.create(ReqVersionsModel, {
            requirement: em.create(ReqStaticModel, {
                id: newId,
                createdBy: props.createdById,
                creationDate: props.creationDate
            }),
            isDeleted: false,
            effectiveFrom: props.creationDate,
            modifiedBy: props.createdById,
            ...mappedProps
        })

        await em.flush()

        return newId
    }

    /**
     * Get all active requirements with the given solution id.
     * @param props.solutionId The id of the solution to find requirements for
     * @param props.reqType The type of requirement to find
     */
    async getAllActive<R extends RequirementType>(props: {
        solutionId: string,
        reqType: ReqType
    }): Promise<R[]> {
        const em = this._em,
            reqTypePascal = snakeCaseToPascalCase(props.reqType) as keyof typeof req,
            ReqStaticModel = reqModels[`${reqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
            mapper = new DataModelToDomainModel();

        const reqStatics = (await em.find(ReqStaticModel, {
            versions: {
                solution: { id: props.solutionId },
                workflowState: { $in: [WorkflowState.Active, WorkflowState.Removed] },
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            }
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
                latestRemoved = versions.find(v => v.workflowState === WorkflowState.Removed);

            // Compare effectiveFrom dates to determine validity
            if (latestRemoved && (!latestActive || latestRemoved.effectiveFrom > latestActive.effectiveFrom))
                return undefined; // A newer Removed version exists, so no Active version is valid

            return req[reqTypePascal].parse(
                await mapper.map({ ...reqStatic, ...latestActive })
            ) as R
        })).then((reqs) => reqs.filter((req) => req !== undefined))

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
        solutionId: string,
        reqType: ReqType,
        workflowState: WorkflowState
    }): Promise<R[]> {
        const em = this._em,
            reqTypePascal = snakeCaseToPascalCase(props.reqType) as keyof typeof req,
            ReqStaticModel = reqModels[`${reqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
            mapper = new DataModelToDomainModel();

        const reqStatics = (await em.find(ReqStaticModel, {
            versions: {
                solution: { id: props.solutionId },
                workflowState: props.workflowState,
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            }
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
        })).then((reqs) => reqs.filter((req) => req !== undefined))

        return requirements
    }

    /**
     * Get all requirements with the given solution id across all workflow states.
     * @param props.solutionId The id of the solution to find requirements for
     * @param props.reqType The type of requirement to find
     * @returns The requirements across all workflow states
     */
    async getAll<R extends RequirementType>(props: {
        solutionId: string,
        reqType: ReqType
    }): Promise<R[]> {
        const em = this._em,
            reqTypePascal = snakeCaseToPascalCase(props.reqType) as keyof typeof req,
            ReqStaticModel = reqModels[`${reqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
            mapper = new DataModelToDomainModel();

        const reqStatics = (await em.find(ReqStaticModel, {
            versions: {
                solution: { id: props.solutionId },
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            }
        }));

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
                latestVersion = versions[0];

            if (!latestVersion)
                return undefined;

            return req[reqTypePascal].parse(
                await mapper.map({ ...reqStatic, ...latestVersion })
            ) as R;
        })).then((reqs) => reqs.filter((req) => req !== undefined));

        return requirements;
    }

    /**
     * Get a requirement by its id
     * @param id The id of the requirement to get
     * @returns The requirement with the given id
     * @throws {NotFoundException} If the requirement does not exist
     */
    async getById<R extends RequirementType>(id: z.infer<typeof Requirement>['id']): Promise<R> {
        const em = this._em,
            // TODO: can this be replaced with em.findOne(RequirementModel, { id })?
            // Will it become the appropriate subtype?
            reqStatic = await em.findOne(reqModels.RequirementModel, { id }),
            reqLatestVersion = await reqStatic?.getLatestVersion(new Date())
        // result = await em.getConnection().execute(em.getKnex()
        //     .select('*')
        //     .from('requirement')
        //     .where('id', id)
        //     .first()
        // );

        if (!reqStatic || !reqLatestVersion)
            throw new NotFoundException(`Requirement with id ${id} not found`);

        const req_type: ReqType = reqStatic.req_type,
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
        reqProps: Omit<Partial<RequirementType>, 'reqIdPrefix' | keyof z.infer<typeof AuditMetadata>>
        & { id: z.infer<typeof Requirement>['id'], reqType: ReqType }
    }): Promise<void> {
        const em = this._em,
            { reqType, ...reqProps } = props.reqProps,
            ReqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
            ReqStaticModel = reqModels[`${ReqTypePascal}Model` as keyof typeof reqModels] as typeof reqModels.RequirementModel,
            ReqVersionsModel = reqModels[`${ReqTypePascal}VersionsModel` as keyof typeof reqModels] as typeof reqModels.RequirementVersionsModel,
            mappedProps = await new ReqQueryToModelQuery().map(reqProps) as any

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
            modifiedBy: props.modifiedById
        })

        await em.flush()
    }
}