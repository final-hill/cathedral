import type { Properties } from '~/types/Properties.mjs';
import type { Uuid } from '~/types/Uuid.mjs';
import Entity from './Entity.mjs';

/**
 * Goals are the needs and wants of an organization.
 * They are the things that the organization wants to achieve.
 */
export default class Goals extends Entity {
    /**
     * Functional behaviors specify what results or effects are expected from the system.
     * They specify "what" the system should do, not "how" it should do it.
     */
    functionalBehaviorIds: Uuid[];
    objective: string;
    outcomes: string;
    stakeholderIds: Uuid[];
    situation: string;
    useCaseIds: Uuid[];
    limitIds: Uuid[];

    constructor(options: Properties<Goals>) {
        super(options);
        this.functionalBehaviorIds = options.functionalBehaviorIds;
        this.objective = options.objective;
        this.outcomes = options.outcomes;
        this.stakeholderIds = options.stakeholderIds;
        this.situation = options.situation;
        this.useCaseIds = options.useCaseIds;
        this.limitIds = options.limitIds;
    }
}