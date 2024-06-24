import Entity from "~/domain/Entity";
import type { Properties } from "~/domain/Properties";

/**
 * Property imposed by the environment
 */
export default class ConstraintCategory extends Entity {
    constructor({ name, ...rest }: Properties<ConstraintCategory>) {
        super({ ...rest });

        this.name = name;
    }

    name: string;
}