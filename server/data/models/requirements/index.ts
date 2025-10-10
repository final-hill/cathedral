import { Collection, Entity, Enum, ManyToOne, OneToMany, ManyToMany, OptionalProps, PrimaryKey, Property, types } from '@mikro-orm/core'
import type { FilterQuery, OrderDefinition, Ref, Rel } from '@mikro-orm/core'
import { ConstraintCategory, ReqType, ScenarioStepTypeEnum, StakeholderCategory, StakeholderSegmentation, WorkflowState, InterfaceType } from '../../../../shared/domain/requirements/enums.js'
import { SlackChannelMetaModel } from '../application/index.js'
import type { ReqId } from '../../../../shared/domain/index.js'
import { Prioritizable } from './mixins/index.js'

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
        if (latestRemoved && (!latestActive || latestRemoved.effectiveFrom > latestActive.effectiveFrom)) return undefined // A newer Removed version exists, so no Active version is valid

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

    @Property({ type: types.text })
    readonly description!: string

    @Property({ type: types.string, nullable: true })
    readonly reqId?: ReqId
}

@Entity({ discriminatorValue: ReqType.ACTOR })
export class ActorModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.ACTOR })
export class ActorVersionsModel extends RequirementVersionsModel {
    @Property({ type: types.boolean, default: false })
    readonly isProductOwner!: boolean

    @Property({ type: types.boolean, default: false })
    readonly isImplementationOwner!: boolean

    @Property({ type: types.boolean, default: false })
    readonly canEndorseProjectRequirements!: boolean

    @Property({ type: types.boolean, default: false })
    readonly canEndorseEnvironmentRequirements!: boolean

    @Property({ type: types.boolean, default: false })
    readonly canEndorseGoalsRequirements!: boolean

    @Property({ type: types.boolean, default: false })
    readonly canEndorseSystemRequirements!: boolean
}

@Entity({ discriminatorValue: ReqType.ASSUMPTION })
export class AssumptionModel extends RequirementModel {
    @ManyToOne({ entity: () => UseCaseModel, nullable: true, inversedBy: 'preconditions' })
    readonly useCase?: Ref<UseCaseModel>

    @ManyToOne({ entity: () => ScenarioStepModel, nullable: true, inversedBy: 'preconditions' })
    readonly scenarioStep?: Ref<ScenarioStepModel>
}

@Entity({ discriminatorValue: ReqType.ASSUMPTION })
export class AssumptionVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.BEHAVIOR })
export class BehaviorModel extends RequirementModel {
    @OneToMany({ entity: () => InterfaceOperationModel, mappedBy: 'behavior' })
    readonly interfaceOperations = new Collection<InterfaceOperationModel>(this)
}

@Entity({ discriminatorValue: ReqType.BEHAVIOR })
export class BehaviorVersionsModel extends Prioritizable(RequirementVersionsModel) {
}

@Entity({ discriminatorValue: ReqType.COMPONENT })
export class ComponentModel extends ActorModel { }

@Entity({ discriminatorValue: ReqType.COMPONENT })
export class ComponentVersionsModel extends ActorVersionsModel {
    @ManyToOne({ entity: () => ComponentModel, nullable: true })
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
export class EffectModel extends RequirementModel {
    @ManyToOne({ entity: () => UseCaseModel, nullable: true, inversedBy: 'successGuarantees' })
    readonly useCase?: Ref<UseCaseModel>
}

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

@Entity({ discriminatorValue: ReqType.FUNCTIONALITY })
export class FunctionalityModel extends GoalModel { }

@Entity({ discriminatorValue: ReqType.FUNCTIONALITY })
export class FunctionalityVersionsModel extends GoalVersionsModel { }

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

@Entity({ discriminatorValue: ReqType.INTERACTION })
export class InteractionModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.INTERACTION })
export class InteractionVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.INTERFACE })
export class InterfaceModel extends InteractionModel {
    @OneToMany({ entity: () => InterfaceOperationModel, mappedBy: 'interface' })
    readonly operations = new Collection<InterfaceOperationModel>(this)
}

@Entity({ discriminatorValue: ReqType.INTERFACE })
export class InterfaceVersionsModel extends Prioritizable(InteractionVersionsModel) {
    @Enum({ items: () => InterfaceType })
    readonly interfaceType!: InterfaceType
}

// InterfaceArtifact hierarchy
@Entity({ discriminatorValue: ReqType.REQUIREMENT })
export class InterfaceArtifactModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.REQUIREMENT })
export class InterfaceArtifactVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.INTERFACE_OPERATION })
export class InterfaceOperationModel extends InterfaceArtifactModel {
    @ManyToOne({ entity: () => InterfaceModel, inversedBy: 'operations' })
    readonly interface!: Ref<InterfaceModel>

    @ManyToOne({ entity: () => BehaviorModel, nullable: true, inversedBy: 'interfaceOperations' })
    readonly behavior?: Ref<BehaviorModel>
}

@Entity({ discriminatorValue: ReqType.INTERFACE_OPERATION })
export class InterfaceOperationVersionsModel extends InterfaceArtifactVersionsModel {
    @Property({ type: types.string, nullable: true })
    readonly verb?: string

    @Property({ type: types.string, nullable: true })
    readonly path?: string
}

@Entity({ discriminatorValue: ReqType.INTERFACE_INPUT })
export class InterfaceInputModel extends InterfaceArtifactModel { }

@Entity({ discriminatorValue: ReqType.INTERFACE_INPUT })
export class InterfaceInputVersionsModel extends InterfaceArtifactVersionsModel {
    @Property({ type: types.string })
    readonly inputName!: string

    @Property({ type: types.boolean, default: false })
    readonly required!: boolean

    @Property({ type: types.string, nullable: true })
    readonly dataType?: string

    @Property({ type: types.string, nullable: true })
    readonly constraints?: string
}

@Entity({ discriminatorValue: ReqType.INTERFACE_OUTPUT })
export class InterfaceOutputModel extends InterfaceArtifactModel { }

@Entity({ discriminatorValue: ReqType.INTERFACE_OUTPUT })
export class InterfaceOutputVersionsModel extends InterfaceArtifactVersionsModel {
    @Property({ type: types.string })
    readonly outputName!: string

    @Property({ type: types.string, nullable: true })
    readonly dataType?: string

    @Property({ type: types.string, nullable: true })
    readonly format?: string
}

@Entity({ discriminatorValue: ReqType.INTERFACE_SCHEMA })
export class InterfaceSchemaModel extends InterfaceArtifactModel { }

@Entity({ discriminatorValue: ReqType.INTERFACE_SCHEMA })
export class InterfaceSchemaVersionsModel extends InterfaceArtifactVersionsModel {
    @Property({ type: 'json', nullable: true })
    readonly schema?: object

    @Property({ type: types.string, nullable: true })
    readonly version?: string
}

@Entity({ discriminatorValue: ReqType.INTERFACE_FLOW })
export class InterfaceFlowModel extends InterfaceArtifactModel { }

@Entity({ discriminatorValue: ReqType.INTERFACE_FLOW })
export class InterfaceFlowVersionsModel extends InterfaceArtifactVersionsModel {
    @Property({ type: types.string })
    readonly flowName!: string

    @Property({ type: types.array, default: [] })
    readonly states!: string[]

    @Property({ type: types.string, nullable: true })
    readonly initialState?: string

    @Property({ type: types.array, default: [] })
    readonly finalStates!: string[]

    @Property({ type: types.text, nullable: true })
    readonly transitions?: string
}

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
export class PersonModel extends ActorModel {
    @ManyToMany(() => StakeholderModel, stakeholder => stakeholder.persons, {
        owner: true,
        pivotTable: 'person_stakeholders',
        joinColumn: 'person_id',
        inverseJoinColumn: 'stakeholder_id'
    })
    readonly stakeholders = new Collection<StakeholderModel>(this)
}

@Entity({ discriminatorValue: ReqType.PERSON })
export class PersonVersionsModel extends ActorVersionsModel {
    @Property({ length: 766, type: types.string, nullable: true })
    readonly appUserId?: string
}

@Entity({ discriminatorValue: ReqType.PRODUCT })
export class ProductModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.PRODUCT })
export class ProductVersionsModel extends RequirementVersionsModel { }

@Entity({ discriminatorValue: ReqType.RESPONSIBILITY })
export class ResponsibilityModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.RESPONSIBILITY })
export class ResponsibilityVersionsModel extends RequirementVersionsModel { }

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
export class StakeholderModel extends ComponentModel {
    @ManyToOne({ entity: () => UseCaseModel, nullable: true, inversedBy: 'stakeholders' })
    readonly useCase?: Ref<UseCaseModel>

    @ManyToMany(() => PersonModel, person => person.stakeholders, {
        pivotTable: 'person_stakeholders',
        joinColumn: 'stakeholder_id',
        inverseJoinColumn: 'person_id'
    })
    readonly persons = new Collection<PersonModel>(this)
}

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
export class ScenarioModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.SCENARIO })
export class ScenarioVersionsModel extends Prioritizable(RequirementVersionsModel) {
    @ManyToOne({ entity: () => StakeholderModel })
    readonly primaryActor!: StakeholderModel

    @ManyToOne({ entity: () => OutcomeModel })
    readonly outcome!: OutcomeModel

    @ManyToOne({ entity: () => FunctionalBehaviorModel })
    readonly functionalBehavior!: FunctionalBehaviorModel
}

@Entity({ discriminatorValue: ReqType.SCENARIO_STEP })
export class ScenarioStepModel extends ScenarioModel {
    @ManyToOne({ entity: () => UseCaseModel, inversedBy: 'scenarioSteps' })
    readonly parentScenario!: Ref<UseCaseModel>

    @ManyToOne({ entity: () => ScenarioStepModel, nullable: true })
    readonly parentStep?: Ref<ScenarioStepModel>

    @OneToMany({ entity: () => AssumptionModel, mappedBy: 'scenarioStep' })
    readonly preconditions = new Collection<AssumptionModel>(this)
}

@Entity({ discriminatorValue: ReqType.SCENARIO_STEP })
export class ScenarioStepVersionsModel extends ScenarioVersionsModel {
    @Property({ type: types.integer })
    readonly order!: number

    @Enum({ items: () => ScenarioStepTypeEnum })
    readonly stepType!: ScenarioStepTypeEnum
}

@Entity({ discriminatorValue: ReqType.EPIC })
export class EpicModel extends GoalModel { }

@Entity({ discriminatorValue: ReqType.EPIC })
export class EpicVersionsModel extends GoalVersionsModel {
    @ManyToOne({ entity: () => FunctionalBehaviorModel })
    readonly functionalBehavior!: FunctionalBehaviorModel
}

@Entity({ discriminatorValue: ReqType.SYSTEM_COMPONENT })
export class SystemComponentModel extends ComponentModel { }

@Entity({ discriminatorValue: ReqType.SYSTEM_COMPONENT })
export class SystemComponentVersionsModel extends ComponentVersionsModel { }

@Entity({ discriminatorValue: ReqType.MILESTONE })
export class MilestoneModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.MILESTONE })
export class MilestoneVersionsModel extends RequirementVersionsModel {
    @Property({ type: types.date, nullable: true })
    readonly dueDate?: Date
}

@Entity({ discriminatorValue: ReqType.TASK })
export class TaskModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.TASK })
export class TaskVersionsModel extends RequirementVersionsModel {
    @Property({ type: types.decimal, nullable: true })
    readonly estimatedHours?: number

    @ManyToOne({ entity: () => PersonModel, nullable: true })
    readonly assignedTo?: Ref<PersonModel>

    @Property({ type: types.date, nullable: true })
    readonly dueDate?: Date
}

@Entity({ discriminatorValue: ReqType.TEST_CASE })
export class TestCaseModel extends ScenarioModel { }

@Entity({ discriminatorValue: ReqType.TEST_CASE })
export class TestCaseVersionsModel extends ScenarioVersionsModel { }

@Entity({ discriminatorValue: ReqType.USE_CASE })
export class UseCaseModel extends ScenarioModel {
    @OneToMany({ entity: () => AssumptionModel, mappedBy: 'useCase' })
    readonly preconditions = new Collection<AssumptionModel>(this)

    @OneToMany({ entity: () => ScenarioStepModel, mappedBy: 'parentScenario' })
    readonly scenarioSteps = new Collection<ScenarioStepModel>(this)

    @OneToMany({ entity: () => EffectModel, mappedBy: 'useCase' })
    readonly successGuarantees = new Collection<EffectModel>(this)

    @OneToMany({ entity: () => StakeholderModel, mappedBy: 'useCase' })
    readonly stakeholders = new Collection<StakeholderModel>(this)
}

@Entity({ discriminatorValue: ReqType.USE_CASE })
export class UseCaseVersionsModel extends ScenarioVersionsModel {
    @ManyToOne({ entity: () => SystemComponentModel })
    readonly scope!: Ref<SystemComponentModel>

    @Property({ type: types.uuid })
    readonly triggerId!: string
}

@Entity({ discriminatorValue: ReqType.USER_STORY })
export class UserStoryModel extends ScenarioModel { }

@Entity({ discriminatorValue: ReqType.USER_STORY })
export class UserStoryVersionsModel extends ScenarioVersionsModel { }
