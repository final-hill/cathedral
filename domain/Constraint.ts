import type { Properties } from "~/domain/Properties";
import Requirement from "~/domain/Requirement";
import type { Uuid } from "~/domain/Uuid";

export default class Constraint extends Requirement {
    categoryId: Uuid;

    constructor({ categoryId, ...rest }: Properties<Constraint>) {
        super(rest);

        this.categoryId = categoryId;
    }
}