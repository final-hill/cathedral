import type { Properties } from "~/server/domain/Properties";
import Requirement from "~/server/domain/Requirement";
import ConstraintCategory from "./ConstraintCategory";

export default class Constraint extends Requirement {
    categoryId: keyof Omit<typeof ConstraintCategory, 'prototype'>

    constructor({ categoryId, ...rest }: Properties<Constraint>) {
        super(rest);

        this.categoryId = categoryId;
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            categoryId: this.categoryId
        }
    }
}