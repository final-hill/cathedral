import type { Properties } from '~/types/Properties.mjs';
import Entity from './Entity.mjs';
import type Behavior from './Behavior.mjs';
import type Stakeholder from './Stakeholder.mjs';
import type UseCase from './UseCase.mjs';
import type Limit from './Limit.mjs';

/**
 * Goals are the needs and wants of an organization.
 * They are the things that the organization wants to achieve.
 */
export default class Goals extends Entity {
    /**
     * Functional behaviors specify what results or effects are expected from the system.
     * They specify "what" the system should do, not "how" it should do it.
     */
    functionalBehaviors!: Behavior[];
    objective!: string;
    outcomes!: string;
    stakeholders!: Stakeholder[];
    situation!: string;
    useCases!: UseCase[];
    limits!: Limit[];

    constructor({ id, ...rest }: Properties<Goals>) {
        super({ id });
        Object.assign(this, rest);
    }
}