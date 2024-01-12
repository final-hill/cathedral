import type { Properties } from '~/types/Properties.mjs';
import Requirement from './Requirement.mjs';

export enum ConstraintCategory {
    BusinessRule = 'Business Rule',
    PhysicalLaw = 'Physical Law',
    EngineeringDecision = 'Engineering Decision'
}

export default class Constraint extends Requirement {
    constructor(options: Properties<Constraint>) {
        super(options);

        this.category = options.category;
    }

    category: ConstraintCategory;
}