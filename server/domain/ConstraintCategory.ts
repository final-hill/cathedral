import Entity from "./Entity";
import { type Properties } from "./Properties";

export default class ConstraintCategory extends Entity<string> {
    static BUSINESS = new ConstraintCategory({ id: 'BUSINESS', description: 'Business Rule' });
    static PHYSICS = new ConstraintCategory({ id: 'PHYSICS', description: 'Physical Law' });
    static ENGINEERING = new ConstraintCategory({ id: 'ENGINEERING', description: 'Engineering Decision' });

    /**
     * The description of the priority.
     */
    description: string;

    constructor({ description, id }: Properties<ConstraintCategory>) {
        super({ id });
        this.description = description
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            description: this.description
        }
    }
}