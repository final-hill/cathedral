import type { Properties } from "~/domain/Properties";
import Requirement from "~/domain/Requirement";

/**
 * Property imposed by the environment
 */
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