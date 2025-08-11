import { Collection, Entity, Enum, ManyToOne, OneToMany, OptionalProps, PrimaryKey, Property, types } from '@mikro-orm/core'
import type { FilterQuery, OrderDefinition, Ref, Rel } from '@mikro-orm/core'
import { ConstraintCategory, MoscowPriority, ReqType, StakeholderCategory, StakeholderSegmentation, WorkflowState } from '../../../../shared/domain/requirements/enums.js'
import { SlackChannelMetaModel } from '../application/index.js'
import type { ReqId } from '../../../../shared/domain/index.js'

export abstract class StaticAuditModel<V extends VolatileAuditModel> {
    @Property({ type: types.string, length: 766 })
    readonly createdById!: string

    @Property({ type: types.datetime })
    readonly creationDate!: Date

    abstract readonly versions: Collection<V, object>

    /**
     * Gets the latest non-deleted version of this entity at the given effective date.
     * This is the standard method for retrieving the current active state of an entity.
     *
     * @param effectiveDate - The date at which to evaluate the latest version
     * @param filter - Additional filter criteria to apply when finding versions
     * @returns The latest non-deleted version, or undefined if none exists
     */
    async getLatestVersion(effectiveDate: Date, filter: FilterQuery<V> = {}): Promise<V | undefined> {
        const where = {
                effectiveFrom: { $lte: effectiveDate },
                isDeleted: false,
                ...filter
            } as FilterQuery<V>,

            latestVersion = (await this.versions.matching({
                where,
                orderBy: { effectiveFrom: 'desc' } as OrderDefinition<V>,
                limit: 1,
                // @ts-expect-error - MikroORM populate types are not fully compatible
                populate: ['*']
            }))[0]

        return latestVersion
    }

    /**
     * Gets the latest version of this entity at the given effective date, including deleted versions.
     * This is useful for checking the current state of an entity, including whether it has been deleted.
     */
    async getLatestVersionIncludingDeleted(effectiveDate: Date, filter: FilterQuery<V> = {}): Promise<V | undefined> {
        const where = {
                effectiveFrom: { $lte: effectiveDate },
                ...filter
            } as FilterQuery<V>,

            latestVersion = (await this.versions.matching({
                where,
                orderBy: { effectiveFrom: 'desc' } as OrderDefinition<V>,
                limit: 1,
                // @ts-expect-error - MikroORM populate types are not fully compatible
                populate: ['*']
            }))[0]

        return latestVersion
    }
}

export abstract class VolatileAuditModel {
    @PrimaryKey({ type: types.datetime })
    readonly effectiveFrom!: Date

    @Property({ type: types.boolean })
    readonly isDeleted!: boolean

    @Property({ type: types.string, length: 766 })
    readonly modifiedById!: string
}

@Entity({ abstract: true, tableName: 'requirement', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementModel extends StaticAuditModel<RequirementVersionsModel> {
    [OptionalProps]?: 'req_type'

    @Enum({ items: () => ReqType })
    readonly req_type!: ReqType

    @PrimaryKey({ type: types.uuid })
    readonly id!: string

    @OneToMany(() => RequirementVersionsModel, e => e.requirement, { orderBy: { effectiveFrom: 'desc' } })
    readonly versions = new Collection<RequirementVersionsModel>(this)

    @ManyToOne({ entity: 'ParsedRequirementsModel', nullable: true, inversedBy: 'requirements' })
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
            latestRemoved = versions.find(v => v.workflowState === WorkflowState.Removed)

        // Compare effectiveFrom dates to determine validity
        if (latestRemoved && (!latestActive || latestRemoved.effectiveFrom > latestActive.effectiveFrom))
            return undefined // A newer Removed version exists, so no Active version is valid

        return latestActive // Return the latest Active version if no newer Removed version exists
    }
}

@Entity({ abstract: true, tableName: 'requirement_versions', discriminatorColumn: 'req_type', discriminatorValue: ReqType.REQUIREMENT })
export abstract class RequirementVersionsModel extends VolatileAuditModel {
    [OptionalProps]?: 'req_type'

    @Enum({ items: () => ReqType })
    readonly req_type!: ReqType

    @Enum({ items: () => WorkflowState, default: WorkflowState.Proposed })
    readonly workflowState!: WorkflowState

    @ManyToOne({ primary: true, entity: () => RequirementModel })
    readonly requirement!: RequirementModel

    @ManyToOne({ entity: () => RequirementModel, nullable: true })
    readonly solution?: RequirementModel

    @Property({ type: types.string, length: 100 })
    readonly name!: string

    @Property({ type: types.string, length: 1000 })
    readonly description!: string

    @Property({ type: types.string, nullable: true })
    readonly reqId?: ReqId
}

@Entity({ discriminatorValue: ReqType.ACTOR })
export class ActorModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.ACTOR })
export class ActorVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.ASSUMPTION })
export class AssumptionModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.ASSUMPTION })
export class AssumptionVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.BEHAVIOR })
export class BehaviorModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.BEHAVIOR })
export class BehaviorVersionsModel extends RequirementVersionsModel {
    @Enum({ items: () => MoscowPriority })
    readonly priority!: MoscowPriority
}

@Entity({ discriminatorValue: ReqType.COMPONENT })
export class ComponentModel extends ActorModel { }

@Entity({ discriminatorValue: ReqType.COMPONENT })
export class ComponentVersionsModel extends ActorVersionsModel {
    /**
     * The parent component that this component belongs to
     */
    @ManyToOne({ entity: () => ComponentVersionsModel, nullable: true })
    readonly parentComponent?: Ref<ComponentModel>
}

@Entity({ discriminatorValue: ReqType.CONSTRAINT })
export class ConstraintModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.CONSTRAINT })
export class ConstraintVersionsModel extends RequirementVersionsModel {
    @Enum({ items: () => ConstraintCategory })
    readonly category!: ConstraintCategory
}

@Entity({ discriminatorValue: ReqType.EFFECT })
export class EffectModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.EFFECT })
export class EffectVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.ENVIRONMENT_COMPONENT })
export class EnvironmentComponentModel extends ComponentModel { }

@Entity({ discriminatorValue: ReqType.ENVIRONMENT_COMPONENT })
export class EnvironmentComponentVersionsModel extends ComponentVersionsModel { }

@Entity({ discriminatorValue: ReqType.EXAMPLE })
export class ExampleModel extends BehaviorModel { }

@Entity({ discriminatorValue: ReqType.EXAMPLE })
export class ExampleVersionsModel extends BehaviorVersionsModel { }

@Entity({ discriminatorValue: ReqType.FUNCTIONALITY })
export class FunctionalityModel extends BehaviorModel { }

@Entity({ discriminatorValue: ReqType.FUNCTIONALITY })
export class FunctionalityVersionsModel extends BehaviorVersionsModel { }

@Entity({ discriminatorValue: ReqType.FUNCTIONAL_BEHAVIOR })
export class FunctionalBehaviorModel extends BehaviorModel { }

@Entity({ discriminatorValue: ReqType.FUNCTIONAL_BEHAVIOR })
export class FunctionalBehaviorVersionsModel extends BehaviorVersionsModel {
    @ManyToOne({ entity: () => FunctionalityModel, nullable: true })
    readonly functionality?: Ref<FunctionalityModel>
}

@Entity({ discriminatorValue: ReqType.GLOSSARY_TERM })
export class GlossaryTermModel extends ComponentModel { }

@Entity({ discriminatorValue: ReqType.GLOSSARY_TERM })
export class GlossaryTermVersionsModel extends ComponentVersionsModel { }

@Entity({ discriminatorValue: ReqType.GOAL })
export class GoalModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.GOAL })
export class GoalVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.CONTEXT_AND_OBJECTIVE })
export class ContextAndObjectiveModel extends GoalModel { }

@Entity({ discriminatorValue: ReqType.CONTEXT_AND_OBJECTIVE })
export class ContextAndObjectiveVersionsModel extends GoalVersionsModel { }

@Entity({ discriminatorValue: ReqType.INVARIANT })
export class InvariantModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.INVARIANT })
export class InvariantVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.LIMIT })
export class LimitModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.LIMIT })
export class LimitVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.META_REQUIREMENT })
export class MetaRequirementModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.META_REQUIREMENT })
export class MetaRequirementVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.JUSTIFICATION })
export class JustificationModel extends MetaRequirementModel { }

@Entity({ discriminatorValue: ReqType.JUSTIFICATION })
export class JustificationVersionsModel extends MetaRequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.NOISE })
export class NoiseModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.NOISE })
export class NoiseVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.HINT })
export class HintModel extends NoiseModel { }

@Entity({ discriminatorValue: ReqType.HINT })
export class HintVersionsModel extends NoiseVersionsModel { }

@Entity({ discriminatorValue: ReqType.NON_FUNCTIONAL_BEHAVIOR })
export class NonFunctionalBehaviorModel extends BehaviorModel { }

@Entity({ discriminatorValue: ReqType.NON_FUNCTIONAL_BEHAVIOR })
export class NonFunctionalBehaviorVersionsModel extends BehaviorVersionsModel {
    @ManyToOne({ entity: () => FunctionalityModel, nullable: true })
    readonly functionality?: Ref<FunctionalityModel>
}

@Entity({ discriminatorValue: ReqType.OBSTACLE })
export class ObstacleModel extends GoalModel { }

@Entity({ discriminatorValue: ReqType.OBSTACLE })
export class ObstacleVersionsModel extends GoalVersionsModel { }

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationModel extends MetaRequirementModel {
}

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationVersionsModel extends MetaRequirementVersionsModel {
    @Property({ type: types.string })
    readonly slug!: string
}

@Entity({ discriminatorValue: ReqType.OUTCOME })
export class OutcomeModel extends GoalModel { }

@Entity({ discriminatorValue: ReqType.OUTCOME })
export class OutcomeVersionsModel extends GoalVersionsModel { }

@Entity({ discriminatorValue: ReqType.PARSED_REQUIREMENTS })
export class ParsedRequirementsModel extends MetaRequirementModel {
    @OneToMany({ entity: 'RequirementModel', mappedBy: 'parsedRequirements' })
    readonly requirements = new Collection<RequirementModel>(this)
}

@Entity({ discriminatorValue: ReqType.PARSED_REQUIREMENTS })
export class ParsedRequirementsVersionsModel extends MetaRequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.PERSON })
export class PersonModel extends ActorModel { }

@Entity({ discriminatorValue: ReqType.PERSON })
export class PersonVersionsModel extends ActorVersionsModel {
    @Property({ length: 254, type: types.string })
    readonly email!: string
}

@Entity({ discriminatorValue: ReqType.PRODUCT })
export class ProductModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.PRODUCT })
export class ProductVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.RESPONSIBILITY })
export class ResponsibilityModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.RESPONSIBILITY })
export class ResponsibilityVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.ROLE })
export class RoleModel extends ResponsibilityModel { }

@Entity({ discriminatorValue: ReqType.ROLE })
export class RoleVersionsModel extends ResponsibilityVersionsModel { }

@Entity({ discriminatorValue: ReqType.SILENCE })
export class SilenceModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.SILENCE })
export class SilenceVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionModel extends MetaRequirementModel {
    @OneToMany({ entity: () => SlackChannelMetaModel, mappedBy: 'solution' })
    readonly slackChannels = new Collection<SlackChannelMetaModel>(this)
}

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionVersionsModel extends MetaRequirementVersionsModel {
    @Property({ type: types.string })
    readonly slug!: string

    /**
     * The organization that the solution belongs to
     */
    @ManyToOne({ entity: () => OrganizationModel })
    readonly organization!: Ref<OrganizationModel>
}

@Entity({ discriminatorValue: ReqType.STAKEHOLDER })
export class StakeholderModel extends ComponentModel { }

@Entity({ discriminatorValue: ReqType.STAKEHOLDER })
export class StakeholderVersionsModel extends ComponentVersionsModel {
    @Enum({ items: () => StakeholderSegmentation })
    readonly segmentation!: StakeholderSegmentation

    @Enum({ items: () => StakeholderCategory })
    readonly category!: StakeholderCategory

    @Property<StakeholderVersionsModel>({ type: types.integer })
    readonly interest!: number

    @Property<StakeholderVersionsModel>({ type: types.integer })
    readonly influence!: number
}

@Entity({ discriminatorValue: ReqType.SCENARIO })
export class ScenarioModel extends ExampleModel { }

@Entity({ discriminatorValue: ReqType.SCENARIO })
export class ScenarioVersionsModel extends ExampleVersionsModel {
    @ManyToOne({ entity: () => StakeholderModel })
    readonly primaryActor!: StakeholderModel

    @ManyToOne({ entity: () => OutcomeModel })
    readonly outcome!: OutcomeModel
}

@Entity({ discriminatorValue: ReqType.EPIC })
export class EpicModel extends ScenarioModel { }

@Entity({ discriminatorValue: ReqType.EPIC })
export class EpicVersionsModel extends ScenarioVersionsModel {
    @ManyToOne({ entity: () => FunctionalBehaviorModel })
    readonly functionalBehavior!: FunctionalBehaviorModel
}

@Entity({ discriminatorValue: ReqType.SYSTEM_COMPONENT })
export class SystemComponentModel extends ComponentModel { }

@Entity({ discriminatorValue: ReqType.SYSTEM_COMPONENT })
export class SystemComponentVersionsModel extends ComponentVersionsModel { }

@Entity({ discriminatorValue: ReqType.TASK })
export class TaskModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.TASK })
export class TaskVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.TEST_CASE })
export class TestCaseModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.TEST_CASE })
export class TestCaseVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.USE_CASE })
export class UseCaseModel extends ScenarioModel { }

@Entity({ discriminatorValue: ReqType.USE_CASE })
export class UseCaseVersionsModel extends ScenarioVersionsModel {
    @Property({ type: types.string })
    readonly scope!: string

    @Property({ type: types.string })
    readonly level!: string

    @ManyToOne({ entity: () => AssumptionModel })
    readonly precondition!: AssumptionModel

    @Property({ type: types.uuid })
    readonly triggerId!: string

    @Property({ type: types.string })
    readonly mainSuccessScenario!: string

    @ManyToOne({ entity: () => EffectModel })
    readonly successGuarantee!: EffectModel

    @Property({ type: types.string })
    readonly extensions!: string
}

@Entity({ discriminatorValue: ReqType.USER_STORY })
export class UserStoryModel extends ScenarioModel { }

@Entity({ discriminatorValue: ReqType.USER_STORY })
export class UserStoryVersionsModel extends ScenarioVersionsModel {
    @ManyToOne({ entity: () => FunctionalBehaviorModel })
    readonly functionalBehavior!: FunctionalBehaviorModel
}
