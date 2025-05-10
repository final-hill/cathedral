import { Collection, Entity, Enum, ManyToOne, OneToMany, OptionalProps, PrimaryKey, Property, type Rel, types } from '@mikro-orm/core';
import { StaticAuditModel, VolatileAuditModel } from './AuditModel.js';
import { ReqType, WorkflowState } from '../../../../shared/domain/requirements/enums.js';
import { type ReqId } from '../../../../shared/domain/requirements/Requirement.js';
import { ParsedRequirementsModel } from '../index.js';

@Entity({ abstract: true, tableName: 'requirement', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementModel extends StaticAuditModel<RequirementVersionsModel> {
    [OptionalProps]?: 'req_type'

    @Enum({ items: () => ReqType })
    readonly req_type!: ReqType;

    @PrimaryKey({ type: types.uuid })
    readonly id!: string;

    @OneToMany(() => RequirementVersionsModel, (e) => e.requirement, { orderBy: { effectiveFrom: 'desc' } })
    readonly versions = new Collection<RequirementVersionsModel>(this);

    @ManyToOne({ entity: () => ParsedRequirementsModel, nullable: true, inversedBy: (e) => e.requirements })
    readonly parsedRequirements?: Rel<ParsedRequirementsModel>

    async getLatestActiveVersion(): Promise<RequirementVersionsModel | undefined> {
        const versions = await this.versions.matching({
            where: {
                effectiveFrom: { $lte: new Date() },
                workflowState: { $in: [WorkflowState.Active, WorkflowState.Removed] },
                isDeleted: false
            },
            orderBy: { effectiveFrom: 'desc' },
            limit: 2, // Retrieve the most recent Active and Removed versions
            populate: ['*']
        }),
            latestActive = versions.find(v => v.workflowState === WorkflowState.Active),
            latestRemoved = versions.find(v => v.workflowState === WorkflowState.Removed);

        // Compare effectiveFrom dates to determine validity
        if (latestRemoved && (!latestActive || latestRemoved.effectiveFrom > latestActive.effectiveFrom))
            return undefined; // A newer Removed version exists, so no Active version is valid

        return latestActive; // Return the latest Active version if no newer Removed version exists
    }
}

@Entity({ abstract: true, tableName: 'requirement_versions', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementVersionsModel extends VolatileAuditModel {
    [OptionalProps]?: 'req_type'

    @Enum({ items: () => ReqType })
    readonly req_type!: ReqType;

    @Enum({ items: () => WorkflowState, default: WorkflowState.Proposed })
    readonly workflowState!: WorkflowState;

    @ManyToOne({ primary: true, entity: () => RequirementModel })
    readonly requirement!: RequirementModel;

    @ManyToOne({ entity: () => RequirementModel, nullable: true })
    readonly solution?: RequirementModel;

    @Property({ type: types.string, length: 100 })
    readonly name!: string

    @Property({ type: types.string, length: 1000 })
    readonly description!: string

    @Property({ type: types.string, nullable: true })
    readonly reqId?: ReqId
}