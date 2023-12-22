import type { Properties } from '~/types/Properties.mjs';
import type { Uuid } from '~/types/Uuid.mjs';
import PEGS from './PEGS.mjs';

/**
 * Goals are the needs and wants of an organization.
 * They are the things that the organization wants to achieve.
 */
export default class Goals extends PEGS {
    /**
     * Functional behaviors specify what results or effects are expected from the system.
     * They specify "what" the system should do, not "how" it should do it.
     */
    functionalBehaviors: Uuid[];
    objective: string;
    outcomes: string;
    stakeholders: Uuid[];
    situation: string;
    useCases: Uuid[];
    limits: Uuid[];

    constructor(options: Properties<Goals>) {
        super(options);
        this.functionalBehaviors = options.functionalBehaviors;
        this.objective = options.objective;
        this.outcomes = options.outcomes;
        this.stakeholders = options.stakeholders;
        this.situation = options.situation;
        this.useCases = options.useCases;
        this.limits = options.limits;
    }
}