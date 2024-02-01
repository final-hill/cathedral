import type { Properties } from '~/types/Properties.mjs';
import Requirement from './Requirement.mjs';

export enum ConstraintCategory {
    BusinessRule = 'Business Rule',
    PhysicalLaw = 'Physical Law',
    EngineeringDecision = 'Engineering Decision'
}

export default class Constraint extends Requirement {
    category: ConstraintCategory;

    constructor({ category, ...rest }: Properties<Constraint>) {
        super(rest);

        this.category = category;
    }
}